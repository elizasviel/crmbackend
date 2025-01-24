import { Ticket } from "@prisma/client";
import { io } from "../server";

export class NotificationService {
  async sendSLAAlert(ticket: Ticket) {
    // Send to all team members
    io.to(`team-${ticket.teamId}`).emit("sla-alert", {
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

  private async sendEmailNotification(ticket: Ticket) {
    // Implement email sending logic here
    // You might want to use a service like SendGrid or AWS SES
  }
}
