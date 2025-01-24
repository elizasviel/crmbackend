import { PrismaClient, Priority, TicketStatus } from "@prisma/client";
import { NotificationService } from "./notification.service";

export class SLAService {
  private prisma: PrismaClient;
  private notificationService: NotificationService;

  private SLA_THRESHOLDS = {
    URGENT: 1 * 60 * 60 * 1000, // 1 hour
    HIGH: 4 * 60 * 60 * 1000, // 4 hours
    MEDIUM: 24 * 60 * 60 * 1000, // 24 hours
    LOW: 48 * 60 * 60 * 1000, // 48 hours
  };

  constructor() {
    this.prisma = new PrismaClient();
    this.notificationService = new NotificationService();
  }

  async checkSLABreaches() {
    const tickets = await this.prisma.ticket.findMany({
      where: {
        status: TicketStatus.OPEN,
      },
      include: {
        assignedTo: true,
        team: true,
      },
    });

    for (const ticket of tickets) {
      const threshold =
        this.SLA_THRESHOLDS[
          ticket.priority as keyof typeof this.SLA_THRESHOLDS
        ];
      const timeOpen = Date.now() - ticket.createdAt.getTime();

      if (timeOpen > threshold) {
        await this.notificationService.sendSLAAlert(ticket);
      }
    }
  }
}
