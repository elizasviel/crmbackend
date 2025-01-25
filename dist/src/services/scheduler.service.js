"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const cron_1 = require("cron");
const sla_service_1 = require("./sla.service");
class SchedulerService {
    constructor() {
        this.slaService = new sla_service_1.SLAService();
        // Run SLA checks every 5 minutes
        this.slaCheckJob = new cron_1.CronJob("*/5 * * * *", () => {
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
exports.SchedulerService = SchedulerService;
