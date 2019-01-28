import { TestBed } from '@angular/core/testing';

import { ChatSocketService } from './chatSocket.service';

describe('ChatService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChatSocketService = TestBed.get(ChatSocketService);
    expect(service).toBeTruthy();
  });
});
