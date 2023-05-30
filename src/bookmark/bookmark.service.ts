import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {
    constructor(private prisma: PrismaService){}

    getBookmarks(userId: string){
        return this.prisma.bookmark.findMany({
            where: { 
                userId
            }
        })
    }
    
    async getBookmarkById(userId: string, bookmarId: number){
        const bookmark = await this.prisma.bookmark.findFirst({
            where: {
                userId,
                id: bookmarId,
            }
        })

        return bookmark;
    }
    
    async createBookMark(userId: string, dto: CreateBookmarkDto){
        const bookmark = await this.prisma.bookmark.create({
            data: {
                userId,
                ...dto,
            }
        })

        return bookmark;
    }
    
    async editBookMarkById(userId: string, bookmarId: number, dto: EditBookmarkDto){
        // get the bookmark by id
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarId
            }
        })
        // chek if the user owns the bookmark
        if (!bookmark || bookmark.userId !== userId) {
            throw new ForbiddenException(
                'Access to resource denied,'
            );
        }

        // make the changes
        return  this.prisma.bookmark.update({
            where: {
                id: bookmarId,
            },
            data: {
                ...dto,
            }
        })

    }

    async deleteBoookMarkById(userId: string, bookmarId: number){
        // get the bookmark by id
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarId
            }
        })

        // chek if the user owns the bookmark
        if (!bookmark || bookmark.userId !== userId) {
            throw new ForbiddenException(
                'Access to resource denied,'
            );
        }
        
        // delete it
        await  this.prisma.bookmark.delete({ where: {id: bookmarId}
        })
    }
}
