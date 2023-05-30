import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3000);

    prisma = app.get(PrismaService)
    await prisma.cleanDb()

    pactum.request.setBaseUrl('http://localhost:3000')
  });

  afterAll(()=>{
    app.close();
  });


  const dto: AuthDto = {
    email: 'joe@doe.com',
    password: '123'
  }

  describe('Auth', () => {
    // --------------------------- SIGNUP ---------------------
    describe('Signup', () => {
      it('Should throw error - empty email', () => {
        return pactum
          .spec()
          .post('/auth/signup',).withBody({
            password: dto.password
          })
          .expectStatus(400)
      })
      it('Should throw error - empty password', () => {
        return pactum
          .spec()
          .post('/auth/signup',).withBody({
            email: dto.email
          })
          .expectStatus(400)
      })
      it('Should throw error - if there is no body', () => {
        return pactum
          .spec()
          .post('/auth/signup',)
          .expectStatus(400)
      })
      it('Should Signup', () => {
        return pactum
          .spec()
          .post('/auth/signup',).withBody(dto)
          .expectStatus(201)
      })
    });

    // --------------------------- SIGNIN ---------------------
    describe('Signin', () => {
      it('Should throw error - empty email', () => {
        return pactum
          .spec()
          .post('/auth/signin',).withBody({
            password: dto.password
          })
          .expectStatus(400)
      })
      it('Should throw error - empty password', () => {
        return pactum
          .spec()
          .post('/auth/signin',).withBody({
            email: dto.email
          })
          .expectStatus(400)
      })
      it('Should throw error - if there is no body', () => {
        return pactum
          .spec()
          .post('/auth/signin',)
          .expectStatus(400)
      })
      it('Should Signin', () => {
        return pactum
        .spec()
        .post('/auth/signin',).withBody(dto)
        .expectStatus(200)
        .stores('token', 'access_token')
      })
    });
  });
    
  describe('User', () => {
    //---------------------------- GET USER ---------------------
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
        .spec()
        .get('/users/me',)
        .withHeaders({
          Authorization: 'Bearer $S{token}',
        })
        .expectStatus(200)
        .inspect()
      })

    });

    //------------------------------ EDIT USER -----------------------
    describe('Edit me', () => {
      it('should edit current user', () => {
        const dto: EditUserDto = {
          firstName: 'Joe',
          lastName: 'Doe',
        }
        return pactum
        .spec()
        .patch('/users',)
        .withHeaders({
          Authorization: 'Bearer $S{token}',
        })
        .expectStatus(200).withBody(dto)
        .expectBodyContains(dto.firstName)
        .expectBodyContains(dto.lastName)
        .inspect()
      })
    });
  });

  describe('Bookmarks', () => {

    //----------------- EMPTY BOOKMARKS -------------
    describe('Get empty bookmarks', () => {
      it('Should get bookmarks', () => {
        return pactum
        .spec()
        .get('/bookmarks',)
        .withHeaders({
          Authorization: 'Bearer $S{token}',
        })
        .expectStatus(200)
        .inspect()
        .expectBody([])
      })
    });

    //----------------- CREATE ----------------------
    describe('Create bookmarks', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookmark',
        link: 'https://web-portfolio-eight-cyan.vercel.app/',
      }
      it('Should create bookmark', () => {
        return pactum
        .spec()
        .post('/bookmarks',)
        .withHeaders({
          Authorization: 'Bearer $S{token}',
        })
        .withBody(dto)
        .expectStatus(201)
        .stores('bookmarkId', 'id')
        .inspect()
      })
    });

    //---------------- GET ALL----------------------
    describe('Get bookmarks', () => {
      it('Should get bookmarks', () => {
        return pactum
        .spec()
        .get('/bookmarks',)
        .withHeaders({
          Authorization: 'Bearer $S{token}',
        })
        .expectStatus(200)
        .expectJsonLength(1)
        .inspect();
      })
    });

    //---------------- GET BY ID -------------------
    describe('Get bookmarks by id', () => {
      it('Should get bookmark by id', () => {
        return pactum
        .spec()
        .get('/bookmarks/{id}',)
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{token}',
        })
        .expectStatus(200)
        .expectBodyContains('$S{bookmarkId}')
        .inspect();
      })
    });
    
    //---------------- EDIT BY ID ------------------
    describe('Edit bookmarks', () => {
      const dto: EditBookmarkDto = {
        title: 'My Portifolio',
        description: 'That portifolio is one of my frist projects'
      }
      it('Should edit bookmark by id', () => {
        return pactum
        .spec()
        .patch('/bookmarks/{id}',)
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{token}',
        })
        .withBody(dto)
        .expectStatus(200)
        .expectBodyContains('$S{bookmarkId}')
        .expectBodyContains(dto.title)
        .expectBodyContains(dto.description)
        .inspect();
      })
    });
    
    //---------------- DELETE BY ID ----------------
    describe('Delete bookmarks', () => {
      it('Should delete bookmark by id', () => {
        return pactum
        .spec()
        .delete('/bookmarks/{id}',)
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{token}',
        })
        .expectStatus(204)
      });
      it('Should get empity bookmarks', () =>{
        return pactum
        .spec()
        .get('/bookmarks',)
        .withHeaders({
          Authorization: 'Bearer $S{token}',
        })
        .expectStatus(200)
        .inspect()
        .expectBody([])
      })
    });
  });
});