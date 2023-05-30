import { Controller, Delete, Get, Patch, Post, UseGuards, Param, ParseIntPipe, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { GetUser } from '../auth/decorator';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
    constructor(private bookmarkService: BookmarkService) {}

    @Get()
    getBookmarks(@GetUser("id") userId: string) {
        return this.bookmarkService.getBookmarks(userId)
    }

    @Get(':id')
    getBookmarkById(
        @GetUser("id") userId: string,
        @Param('id', ParseIntPipe) bookmarId: number,
        ) {
            return this.bookmarkService.getBookmarkById(userId, bookmarId)
        }

    @Post()
    createBookmark(
        @GetUser("id") userId: string,
        @Body() dto: CreateBookmarkDto,
        ) {
            return this.bookmarkService.createBookMark(userId, dto)
        }
    
    @Patch(':id')
    editBookmarkById(
        @GetUser("id") userId: string,
        @Param('id', ParseIntPipe) bookmarId: number,
        @Body() dto: EditBookmarkDto,
        ) {
            return this.bookmarkService.editBookMarkById(userId, bookmarId, dto)
        }
    
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteookmarkById(
        @GetUser("id") userId: string,
        @Param('id', ParseIntPipe) bookmarId: number,
        ) {
            return this.bookmarkService.deleteBoookMarkById(userId, bookmarId)
        }
}
