import { CronJob } from "cron";
import { SLAService } from "./sla.service";

export class SchedulerService {
  private slaService: SLAService;
  private slaCheckJob: CronJob;

  constructor() {
    this.slaService = new SLAService();

    // Run SLA checks every 5 minutes
    this.slaCheckJob = new CronJob("*/5 * * * *", () => {
      this.slaService.checkSLABreaches();
    });
  }

  startJobs() {
    this.slaCheckJob.start();
  }

  stopJobs() {
    this.slaCheckJob.stop();
  }
}
