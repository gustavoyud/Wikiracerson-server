import { HttpService } from '@nestjs/axios';
import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';
import { WikiParserDto } from './wiki.dto';

@Controller('wiki')
export class WikiController {
  constructor(private http: HttpService) {}

  @Get('random')
  public random(@Res() response: Response) {
    const params = {
      action: 'query',
      list: 'random',
      rnnamespace: '0',
      rnlimit: '2',
      format: 'json',
    };
    return this.http
      .get('https://en.wikipedia.org/w/api.php', { params })
      .pipe(
        map(({ data }) =>
          response.status(HttpStatus.OK).json(this.handleRandomResponse(data)),
        ),
      );
  }

  @Get('parser')
  public parser(
    @Query() { titles }: WikiParserDto,
    @Res() response: Response,
  ): Observable<any> {
    const params = {
      format: 'json',
      action: 'parse',
      prop: 'links',
      page: titles,
    };

    return this.http
      .get('https://en.wikipedia.org/w/api.php', { params })
      .pipe(
        map(({ data }) =>
          response.status(HttpStatus.OK).json(this.parseWikiLinks(data)),
        ),
      );
  }

  private handleRandomResponse(data: any) {
    return data?.query?.random.map(({ id, title }) => ({ id, title }));
  }

  private parseWikiLinks(data: any) {
    const pageId = data?.parse?.pageid;
    const links = data?.parse?.links;

    return {
      pageId,
      links: links?.map((data) => ({ label: data['*'], link: data['*'] })),
    };
  }
}
