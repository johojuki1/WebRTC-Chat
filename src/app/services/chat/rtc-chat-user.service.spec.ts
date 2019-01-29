import { TestBed } from '@angular/core/testing';

import { RtcChatUserService } from './rtc-chat-user.service';

describe('RtcChatUserService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RtcChatUserService = TestBed.get(RtcChatUserService);
    expect(service).toBeTruthy();
  });
});
