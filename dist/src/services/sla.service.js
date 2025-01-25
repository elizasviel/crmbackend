"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLAService = void 0;
const client_1 = require("@prisma/client");
const notification_service_1 = require("./notification.service");
class SLAService {
    constructor() {
        this.SLA_THRESHOLDS = {
            URGENT: 1 * 60 * 60 * 1000, // 1 hour
            HIGH: 4 * 60 * 60 * 1000, // 4 hours
            MEDIUM: 24 * 60 * 60 * 1000, // 24 hours
            LOW: 48 * 60 * 60 * 1000, // 48 hours
        };
        this.prisma = new client_1.PrismaClient();
        this.notificationService = new notification_service_1.NotificationService();
    }
    async checkSLABreaches() {
        const tickets = await this.prisma.ticket.findMany({
            where: {
                status: client_1.TicketStatus.OPEN,
            },
            include: {
                assignedTo: true,
                team: true,
            },
        });
        for (const ticket of tickets) {
            const threshold = this.SLA_THRESHOLDS[ticket.priority];
            const timeOpen = Date.now() - ticket.createdAt.getTime();
            if (timeOpen > threshold) {
                await this.notificationService.sendSLAAlert(ticket);
            }
        }
    }
}
exports.SLAService = SLAService;
