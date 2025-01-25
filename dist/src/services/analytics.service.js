"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const client_1 = require("@prisma/client");
class AnalyticsService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async getTicketMetrics() {
        const [totalTickets, averageResolutionTime, priorityDistribution, statusDistribution,] = await Promise.all([
            // Total tickets
            this.prisma.ticket.count(),
            // Average resolution time
            this.prisma.ticket.findMany({
                where: { status: "CLOSED" },
                select: {
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            // Priority distribution
            this.prisma.ticket.groupBy({
                by: ["priority"],
                _count: true,
            }),
            // Status distribution
            this.prisma.ticket.groupBy({
                by: ["status"],
                _count: true,
            }),
        ]);
        return {
            totalTickets,
            averageResolutionTime: this.calculateAverageResolutionTime(averageResolutionTime),
            priorityDistribution,
            statusDistribution,
        };
    }
    calculateAverageResolutionTime(tickets) {
        if (tickets.length === 0)
            return 0;
        const totalTime = tickets.reduce((acc, ticket) => {
            return acc + (ticket.updatedAt.getTime() - ticket.createdAt.getTime());
        }, 0);
        return totalTime / tickets.length / (1000 * 60 * 60); // Convert to hours
    }
}
exports.AnalyticsService = AnalyticsService;
