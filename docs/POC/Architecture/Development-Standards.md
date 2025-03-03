# Development Standards and Patterns

## Code Organization

### Project Structure
```
src/
  ├── components/       # Reusable business components
  ├── config/          # Configuration files
  ├── middleware/      # Custom middleware
  ├── models/          # Data models and schemas
  ├── routes/          # API route definitions
  ├── services/        # Business logic
  └── utils/           # Utility functions
```

## API Standards

### RESTful Endpoints

1. **Naming Conventions**
   - Use plural nouns for resources
   - Use kebab-case for URLs
   - Use camelCase for parameters
   ```
   GET    /api/v1/campaigns
   POST   /api/v1/campaigns
   GET    /api/v1/campaigns/{campaignId}
   PUT    /api/v1/campaigns/{campaignId}
   DELETE /api/v1/campaigns/{campaignId}
   ```

2. **Response Format**
   ```json
   {
     "success": true,
     "data": {},
     "error": null,
     "meta": {
       "pagination": {
         "page": 1,
         "limit": 10,
         "total": 100
       }
     }
   }
   ```

3. **HTTP Status Codes**
   - 200: Success
   - 201: Created
   - 400: Bad Request
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Not Found
   - 500: Internal Server Error

## TypeScript Standards

1. **Type Definitions**
   ```typescript
   // Use interfaces for data models
   interface Campaign {
     id: string;
     name: string;
     status: CampaignStatus;
     startDate: Date;
     endDate?: Date;
   }

   // Use enums for fixed values
   enum CampaignStatus {
     DRAFT = 'DRAFT',
     ACTIVE = 'ACTIVE',
     PAUSED = 'PAUSED',
     COMPLETED = 'COMPLETED'
   }
   ```

2. **Error Handling**
   ```typescript
   class AppError extends Error {
     constructor(
       public statusCode: number,
       public message: string,
       public code?: string
     ) {
       super(message);
     }
   }

   // Usage
   throw new AppError(400, 'Invalid campaign data', 'INVALID_DATA');
   ```

## Database Patterns

1. **Model Structure**
   ```typescript
   import { Entity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

   @Entity()
   export class BaseEntity {
     @CreateDateColumn()
     createdAt: Date;

     @UpdateDateColumn()
     updatedAt: Date;

     @Column({ nullable: true })
     deletedAt?: Date;
   }
   ```

2. **Query Patterns**
   ```typescript
   // Use repositories for database operations
   @Injectable()
   export class CampaignRepository {
     constructor(
       @InjectRepository(Campaign)
       private repository: Repository<Campaign>
     ) {}

     async findActive(): Promise<Campaign[]> {
       return this.repository.find({
         where: {
           status: CampaignStatus.ACTIVE,
           deletedAt: IsNull()
         }
       });
     }
   }
   ```

## Testing Standards

1. **Unit Tests**
   ```typescript
   describe('CampaignService', () => {
     let service: CampaignService;
     let repository: MockType<CampaignRepository>;

     beforeEach(async () => {
       const module = await Test.createTestingModule({
         providers: [
           CampaignService,
           {
             provide: CampaignRepository,
             useFactory: mockRepositoryFactory
           }
         ]
       }).compile();

       service = module.get(CampaignService);
       repository = module.get(CampaignRepository);
     });

     it('should create campaign', async () => {
       const campaign = { name: 'Test Campaign' };
       repository.save.mockResolvedValue(campaign);
       expect(await service.create(campaign)).toEqual(campaign);
     });
   });
   ```

## Logging Standards

1. **Log Levels**
   ```typescript
   import { Logger } from '@nestjs/common';

   const logger = new Logger('CampaignService');

   // Error: System errors
   logger.error('Failed to create campaign', error.stack);

   // Warn: Runtime warnings
   logger.warn('Campaign nearing expiration', { campaignId });

   // Info: Important events
   logger.log('Campaign created successfully', { campaignId });

   // Debug: Development information
   logger.debug('Processing campaign data', { data });
   ```

2. **Log Format**
   ```json
   {
     "timestamp": "2024-01-20T10:00:00.000Z",
     "level": "info",
     "context": "CampaignService",
     "message": "Campaign created successfully",
     "metadata": {
       "campaignId": "123",
       "userId": "456",
       "requestId": "789"
     }
   }
   ```

## Security Standards

1. **Authentication**
   ```typescript
   @Injectable()
   export class JwtAuthGuard extends AuthGuard('jwt') {
     handleRequest(err: any, user: any) {
       if (err || !user) {
         throw new UnauthorizedException();
       }
       return user;
     }
   }
   ```

2. **Authorization**
   ```typescript
   @Injectable()
   export class RolesGuard implements CanActivate {
     constructor(private reflector: Reflector) {}

     canActivate(context: ExecutionContext): boolean {
       const requiredRoles = this.reflector.get<string[]>(
         'roles',
         context.getHandler()
       );

       const { user } = context.switchToHttp().getRequest();
       return requiredRoles.some((role) => user.roles.includes(role));
     }
   }
   ```

## Performance Guidelines

1. **Caching Strategy**
   ```typescript
   @Injectable()
   export class CampaignService {
     constructor(
       @Inject(CACHE_MANAGER)
       private cacheManager: Cache,
       private repository: CampaignRepository
     ) {}

     async findById(id: string): Promise<Campaign> {
       const cacheKey = `campaign:${id}`;
       let campaign = await this.cacheManager.get(cacheKey);

       if (!campaign) {
         campaign = await this.repository.findById(id);
         await this.cacheManager.set(cacheKey, campaign, 3600);
       }

       return campaign;
     }
   }
   ```

2. **Query Optimization**
   ```typescript
   // Use specific columns
   const campaigns = await this.repository
     .createQueryBuilder('campaign')
     .select(['campaign.id', 'campaign.name', 'campaign.status'])
     .where('campaign.status = :status', { status })
     .getMany();

   // Use pagination
   const [campaigns, total] = await this.repository.findAndCount({
     skip: (page - 1) * limit,
     take: limit,
     order: { createdAt: 'DESC' }
   });
   ```

## Deployment Guidelines

1. **Environment Configuration**
   ```typescript
   // config/configuration.ts
   export default () => ({
     port: parseInt(process.env.PORT, 10) || 3000,
     database: {
       host: process.env.DB_HOST,
       port: parseInt(process.env.DB_PORT, 10) || 5432,
       username: process.env.DB_USERNAME,
       password: process.env.DB_PASSWORD,
       database: process.env.DB_DATABASE
     },
     jwt: {
       secret: process.env.JWT_SECRET,
       expiresIn: process.env.JWT_EXPIRES_IN || '1d'
     }
   });
   ```

2. **Health Checks**
   ```typescript
   @Injectable()
   export class HealthService {
     constructor(
       private db: DatabaseService,
       private redis: RedisService
     ) {}

     async check(): Promise<HealthCheckResult> {
       return {
         status: 'ok',
         checks: {
           database: await this.db.ping(),
           redis: await this.redis.ping(),
           memory: process.memoryUsage()
         }
       };
     }
   }
   ```