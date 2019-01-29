import { TestBed } from '@angular/core/testing';

import { RtcChatAdminService } from './rtc-chat-admin.service';

describe('RtcChatAdminService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RtcChatAdminService = TestBed.get(RtcChatAdminService);
    expect(service).toBeTruthy();
  });
});
