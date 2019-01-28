import { TestBed } from '@angular/core/testing';

import { ChatRtcService } from './chat-rtc.service';

describe('ChatRtcService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChatRtcService = TestBed.get(ChatRtcService);
    expect(service).toBeTruthy();
  });
});
