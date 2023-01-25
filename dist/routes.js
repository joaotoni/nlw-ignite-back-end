"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRoutes = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const zod_1 = require("zod");
const prisma_1 = require("./lib/prisma");
async function appRoutes(app) {
    app.post("/habits", async (request) => {
        // itens requisitados para busca de informação: title e weekDays
        const creatHabitBody = zod_1.z.object({
            title: zod_1.z.string(),
            weekDays: zod_1.z.array(zod_1.z.number().min(0).max(6)),
        });
        //[0,]
        const { title, weekDays } = creatHabitBody.parse(request.body);
        const today = (0, dayjs_1.default)().startOf("day").toDate();
        await prisma_1.prisma.habit.create({
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
        const getDayParams = zod_1.z.object({
            date: zod_1.z.coerce.date(),
        });
        const { date } = getDayParams.parse(request.query);
        const parsedDate = (0, dayjs_1.default)(date).startOf("day");
        const weekDay = parsedDate.get("day");
        const possibleHabits = await prisma_1.prisma.habit.findMany({
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
        const day = await prisma_1.prisma.day.findUnique({
            where: {
                date: parsedDate.toDate(),
            },
            include: {
                dayHabits: true,
            },
        });
        const completeHabits = day?.dayHabits.map((dayHabit) => {
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
        const toggleHabitParams = zod_1.z.object({
            id: zod_1.z.string().uuid(),
        });
        const { id } = toggleHabitParams.parse(request.params);
        const today = (0, dayjs_1.default)().startOf("day").toDate(); //para a pessoa completar o habito no dia que ela queria
        let day = await prisma_1.prisma.day.findUnique({
            where: {
                date: today,
            },
        });
        if (!day) {
            day = await prisma_1.prisma.day.create({
                data: {
                    date: today,
                },
            });
        }
        const dayHabit = await prisma_1.prisma.dayHabit.findUnique({
            where: {
                day_id_habit_id: {
                    day_id: day.id,
                    habit_id: id,
                },
            },
        });
        if (dayHabit) {
            await prisma_1.prisma.dayHabit.delete({
                where: {
                    id: dayHabit.id,
                },
            });
            //remover marcação de completo
        }
        else {
            // Completar o Habito
            await prisma_1.prisma.dayHabit.create({
                data: {
                    day_id: day.id,
                    habit_id: id,
                },
            });
        }
    });
    app.get("/summary", async () => {
        //[retornar uma array com varias informações dentro]
        const summary = await prisma_1.prisma.$queryRaw `
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
exports.appRoutes = appRoutes;
