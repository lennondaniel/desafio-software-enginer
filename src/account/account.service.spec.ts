import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { IAccountService } from './interfaces/account.service.interface';

describe('AccountService', () => {
  let service: AccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: IAccountService,
          useClass: AccountService
        }
     ],
    }).compile();

    service = module.get<AccountService>(AccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
