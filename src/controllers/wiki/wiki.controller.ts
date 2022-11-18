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
      action: 'query',
      prop: 'revisions',
      formatversion: '2',
      rvprop: 'content',
      rvslots: '*',
      titles,
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
    const page = data?.query?.pages?.[0];
    const pageId = page?.pageid;
    const stringData = page?.revisions?.[0].slots?.main?.content ?? '';
    const links = stringData?.match(
      /\[{2}([a-zA-Z0-9 \-\(\)]*\|[a-zA-Z0-9 \-]*|[a-zA-Z0-9 \-\(\)]*)\]{2}/g,
    );

    if (!links?.length) {
      return { status: 6007, error: 'Parece que deu ruim!' };
    }

    return {
      pageId,
      links: links
        ?.map((link) => link.replace(/[\[\]]/g, '').split('|'))
        ?.map(([link, label]) => ({ label: label ?? link, link })),
    };
  }
}
