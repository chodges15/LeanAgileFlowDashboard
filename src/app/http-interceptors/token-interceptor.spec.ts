import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { GithubService } from '../github.service';
import { TokenInterceptor } from './token-interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import * as Interfaces from '../interfaces';
import * as MockData from '../mock-github-service-data';
import { UserSettingsService } from '../user-settings.service';
import { UserSettings } from '../user-settings';

describe(`TokenInterceptor`, () => {
  let service: GithubService;
  let httpMock: HttpTestingController;
  let settingsServiceSpy: jasmine.SpyObj<UserSettingsService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('UserSettingsService', ['getUserSettings']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GithubService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenInterceptor,
          multi: true,
        },
        {
          provide: UserSettingsService,
          useValue: spy
        }
      ],
    });

    service = TestBed.get(GithubService);
    httpMock = TestBed.get(HttpTestingController);
    settingsServiceSpy = TestBed.get(UserSettingsService);
  });

  it('should add an Authorization header', () => {
    const testData: Interfaces.IssueSearchResult = MockData.ISSUE_SEARCH;
    const mockUserSettings: UserSettings = new UserSettings('blah', 'test', 'a,b,c');
    settingsServiceSpy.getUserSettings.and.returnValue(mockUserSettings);
    service.getPullRequests('test').subscribe(
      response => expect(response).toBeTruthy(),
      err => fail('Test failed')
    );
    const httpRequest = httpMock.expectOne(
      req => req.method === 'GET' &&
      req.url === '/search/issues?q=type:pr+author:test');
    expect(httpRequest.request.headers.has('Authorization')).toEqual(true);
    expect(httpRequest.request.headers.get('Authorization')).toEqual('Bearer test');
  });
});
