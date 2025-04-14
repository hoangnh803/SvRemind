import { Injectable } from '@nestjs/common';

interface Session {
  clients: Set<WebSocket>;
  scannedUrls: string[];
}

/**
 * Quản lý phiên làm việc cho các client kết nối qua WebSocket.
 * @description Quản lý các phiên làm việc, bao gồm việc tạo phiên mới, thêm và xóa client, và lưu trữ các URL đã quét.
 */
@Injectable()
export class SessionService {
  private sessions = new Map<string, Session>();

  /**
   * @description Sử dụng số ngãu nhiên 36 kí tự để tạo ID phiên làm việc.
   * @returns {string} ID của phiên làm việc mới được tạo.
   */
  createSession(): string {
    const sessionId = Math.random().toString(36).substring(2, 15);
    this.sessions.set(sessionId, { clients: new Set(), scannedUrls: [] });
    return sessionId;
  }

  /**
   * @description Xóa phiên làm việc dựa trên ID phiên.
   * @param {string} sessionId - ID của phiên làm việc cần xóa.
   */
  addClient(sessionId: string, client: WebSocket): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.clients.add(client);
      return true;
    }
    return false;
  }

  removeClient(sessionId: string, client: WebSocket): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.clients.delete(client);
      if (session.clients.size === 0 && session.scannedUrls.length === 0) {
        this.sessions.delete(sessionId);
      }
    }
  }

  addScannedUrl(sessionId: string, url: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.scannedUrls.push(url);
      session.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'scanned-url', url }));
        }
      });
      return true;
    }
    return false;
  }

  getScannedUrls(sessionId: string): string[] {
    const session = this.sessions.get(sessionId);
    return session ? session.scannedUrls : [];
  }
}
