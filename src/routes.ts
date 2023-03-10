import dayjs from "dayjs";
import { create } from "domain";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./lib/prisma";

export async function appRoutes(app: FastifyInstance) {
  app.post("/habits", async (request) => {
    // itens requisitados para busca de informação: title e weekDays
    const creatHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6)),
    });

    //[0,]
    const { title, weekDays } = creatHabitBody.parse(request.body);

    const today = dayjs().startOf("day").toDate();

    await prisma.habit.create({
      data: {
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map((weekDay) => {
            return {
              week_day: weekDay,
            };
          }),
        },
      },
    });
  });

  app.get("/day", async (request) => {
    const getDayParams = z.object({
      date: z.coerce.date(),
    });

    const { date } = getDayParams.parse(request.query);

    const parsedDate = dayjs(date).startOf("day");

    const weekDay = parsedDate.get("day");

    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date,
        },
        weekDays: {
          some: {
            week_day: weekDay,
          },
        },
      },
    });
    const day = await prisma.day.findUnique({
      where: {
        date: parsedDate.toDate(),
      },
      include: {
        dayHabits: true,
      },
    });

    const completeHabits =
      day?.dayHabits.map((dayHabit) => {
        return dayHabit.habit_id;
      }) ?? [];

    return {
      possibleHabits,
      completeHabits,
    };
  });

  //completar ou não completar um habito

  app.patch("/habits/:id/toggle", async (request) => {
    //route param => parâmetro de identificação

    const toggleHabitParams = z.object({
      id: z.string().uuid(),
    });

    const { id } = toggleHabitParams.parse(request.params);

    const today = dayjs().startOf("day").toDate(); //para a pessoa completar o habito no dia que ela queria

    let day = await prisma.day.findUnique({
      where: {
        date: today,
      },
    });
    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today,
        },
      });
    }

    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id,
        },
      },
    });

    if (dayHabit) {
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id,
        },
      });
      //remover marcação de completo
    } else {
      // Completar o Habito
      await prisma.dayHabit.create({
        data: {
          day_id: day.id,
          habit_id: id,
        },
      });
    }
  });

  app.get("/summary", async () => {
    //[retornar uma array com varias informações dentro]

    const summary = await prisma.$queryRaw`
    Select   D.id, D.date,
     
    ( 
      SELECT
      cast(count(*) as float)
      FROM days_habits DH
      WHERE 
        DH.day_id = D.id
    ) as completed,
    (
      SELECT
        cast(count(*) as float)
      FROM habit_week_days HWD  
      JOIN habits H
        ON H.id = HWD.habit_id
      WHERE
        HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as date )
        AND h.created_at <= D.date
    ) as amount
    FROM days D
`;
    return summary;
  });
}
