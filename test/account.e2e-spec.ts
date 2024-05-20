import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { Account } from '../src/account/entities/account.entity';

describe('Account (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    await dataSource.createQueryBuilder().delete().from(Account).execute();

  });

  const createAccount = async (): Promise<void> => {
    await dataSource.createQueryBuilder()
    .insert()
    .into(Account)
    .values({ id: "100", balance: 10 })
    .execute();
  }

  it('should 404 if cant find the account /balance (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/balance?account_id=100')
    
    expect(response.statusCode).toBe(404)
    expect(response.body).toBe(0)
  });

  it('should find a account success /balance (GET)', async () => {

    await createAccount()
    const response = await request(app.getHttpServer())
      .get('/balance?account_id=100')
    
    expect(response.statusCode).toBe(200)
    expect(response.body).toBe(10)
  });

  it('should deposit a successful amount into the existing account /event (POST)', async () => {
    await createAccount()

    const response = await request(app.getHttpServer())
      .post('/event')
      .send({
        type: 'deposit',
        destination: '100',
        amount: 10
      })
    
    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({destination: {id: '100', balance: 20}})
  });

  it('should make a withdrawal and return an error if the account does not exist /event (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/event')
      .send({
        type: 'withdraw',
        origin: '100',
        amount: 10
      })
  
    expect(response.statusCode).toBe(404)
    expect(response.body).toBe(0)
  });

  it('should make a withdrawal and return success /event (POST)', async () => {
    await createAccount()
    const response = await request(app.getHttpServer())
      .post('/event')
      .send({
        type: 'withdraw',
        origin: '100',
        amount: 10
      })
    
    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({origin: {id: '100', balance: 0}})
  });

  it('should make a transfer and return success /event (POST)', async () => {
    await createAccount()
    const response = await request(app.getHttpServer())
      .post('/event')
      .send({
        type: 'transfer',
        origin: '100',
        destination: '300',
        amount: 10
      })
    
    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({origin: {id: '100', balance: 0}, destination: {id: '300', balance: 10}})
  });

  it('should make a transfer and return an error if the account does not exist /event (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/event')
      .send({
        type: 'transfer',
        origin: '100',
        destination: '300',
        amount: 10
      })
    
    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual(0)
  });
});
