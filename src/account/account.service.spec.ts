import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { IAccountService } from './interfaces/account.service.interface';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AccountService', () => {
  let service: IAccountService;
  let repository: Repository<Account>;
  const repositoryToken = getRepositoryToken(Account);
  const mockReturnAccount = { id: '100', balance: 10 }


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: IAccountService,
          useClass: AccountService
        },
        {
          provide: repositoryToken,
          useValue: {
            delete: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn()
          },
        }
     ],
    }).compile();

    service = module.get<IAccountService>(IAccountService);
    repository = module.get<Repository<Account>>(repositoryToken)
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('repository should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should to reset the database', () => {
    jest.spyOn(repository, 'delete')
    service.reset()
    expect(repository.delete).toHaveBeenCalled()
  })

  it('should to create account', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(null)
    jest.spyOn(repository, 'create').mockReturnValueOnce(mockReturnAccount)
    jest.spyOn(repository, 'save').mockResolvedValue(mockReturnAccount)
    const account = await service.executeTransaction({"type":"deposit", "destination":"100", "amount":10})
    expect(account).toEqual({destination: mockReturnAccount})
    expect(repository.findOne).toHaveBeenCalled()
    expect(repository.create).toHaveBeenCalled()
    expect(repository.save).toHaveBeenCalled()
  })

  it('should deposit amount int an existing account', async () => {
    const mockReturnAccountWithDeposit = { id: '100', balance: 20 }
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockReturnAccount)
    jest.spyOn(repository, 'save').mockResolvedValue(mockReturnAccountWithDeposit)
    const account = await service.executeTransaction({"type":"deposit", "destination":"100", "amount":10})
    expect(account).toEqual({destination: mockReturnAccountWithDeposit})
    expect(repository.findOne).toHaveBeenCalled()
    expect(repository.save).toHaveBeenCalled()
  })

  it('should withdraw amount int an existing account', async () => {
    const mockReturnAccountWithWithdraw = { id: '100', balance: 0 }
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockReturnAccount)
    jest.spyOn(repository, 'save').mockResolvedValue(mockReturnAccountWithWithdraw)
    const account = await service.executeTransaction({"type":"withdraw", "origin":"100", "amount":10})
    expect(account).toEqual({origin: mockReturnAccountWithWithdraw})
    expect(repository.findOne).toHaveBeenCalled()
    expect(repository.save).toHaveBeenCalled()
  })
});
