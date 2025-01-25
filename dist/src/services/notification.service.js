"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const server_1 = require("../server");
class NotificationService {
    async sendSLAAlert(ticket) {
        // Send to all team members
        server_1.io.to(`team-${ticket.teamId}`).emit("sla-alert", {
            ticketId: ticket.id,
            title: ticket.title,
            priority: ticket.priority,
            timeOpen: Date.now() - ticket.createdAt.getTime(),
        });
        // You could also implement email notifications here
        if (process.env.ENABLE_EMAIL_NOTIFICATIONS === "true") {
            await this.sendEmailNotification(ticket);
        }
    }
    async sendEmailNotification(ticket) {
        // Implement email sending logic here
        // You might want to use a service like SendGrid or AWS SES
    }
}
exports.NotificationService = NotificationService;
