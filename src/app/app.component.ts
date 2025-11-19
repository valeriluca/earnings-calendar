import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { PorscheDesignSystemModule } from '@porsche-design-system/components-angular';
import { WebPushService } from './services/web-push.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, PorscheDesignSystemModule],
})
export class AppComponent implements OnInit {
  constructor(private webPushService: WebPushService) {}

  async ngOnInit() {
    // Initialize web push notifications
    await this.webPushService.initialize();
  }
}
