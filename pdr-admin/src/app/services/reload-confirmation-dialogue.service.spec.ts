import { TestBed } from '@angular/core/testing';

import { ReloadConfirmationDialogueService } from './reload-confirmation-dialogue.service';

describe('ReloadConfirmationDialogueService', () => {
  let service: ReloadConfirmationDialogueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReloadConfirmationDialogueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
