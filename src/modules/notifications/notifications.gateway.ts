import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;
  private logger: Logger = new Logger('NotificationsGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  notifyNewCourse(course: any) {
    this.server.emit('new_course_added', {
      message: 'A new course has been added!',
      course: course,
    });
  }

  notifyUpdateCourse(course: any) {
    this.server.emit('course_updated', {
      message: 'A course has been updated!',
      course: course,
    });
  }

  notifyDeleteCourse(courseId: string) {
    this.server.emit('course_deleted', {
      message: 'A course has been removed.',
      courseId: courseId,
    });
  }
}
