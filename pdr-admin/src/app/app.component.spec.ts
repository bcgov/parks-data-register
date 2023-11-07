import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { HeaderModule } from './header/header.module';
import { InfiniteLoadingBarModule } from './infinite-loading-bar/infinite-loading-bar.module';
import { FooterModule } from './footer/footer.module';
import { ToastrModule } from 'ngx-toastr';

describe('AppComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HeaderModule, InfiniteLoadingBarModule, FooterModule, ToastrModule.forRoot({})],
      declarations: [AppComponent],
    })
  );

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'pdr-admin'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('pdr-admin');
  });
});
