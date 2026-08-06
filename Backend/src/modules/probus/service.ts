import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ProbusService {
  private readonly logger = new Logger(ProbusService.name);

  async syncAttendanceRecord(record: any): Promise<boolean> {
    this.logger.log(`Syncing attendance record to Probus: ${JSON.stringify(record)}`);
    return true;
  }

  async syncStudentData(student: any): Promise<boolean> {
    this.logger.log(`Syncing student data to Probus: ${JSON.stringify(student)}`);
    return true;
  }

  async syncProfessorData(professor: any): Promise<boolean> {
    this.logger.log(`Syncing professor data to Probus: ${JSON.stringify(professor)}`);
    return true;
  }
}