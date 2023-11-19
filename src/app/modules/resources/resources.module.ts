import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YouTubePlayerModule } from '@angular/youtube-player';

import { ResourcesRoutingModule } from './resources-routing.module';

import { MediaElement } from './elements/media.element';
import { QuestionElement } from './elements/question.element';
import { SliderComponent } from './components/slider/slider.component';
import { ResourcesComponent } from './resources.component';
import { RouterModule } from '@angular/router';
import { MediaComponent } from './components/media/media.component';


@NgModule({
  declarations: [
    SliderComponent,
    ResourcesComponent,
    MediaComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    YouTubePlayerModule,
    ResourcesRoutingModule
  ],
  providers: [
    MediaElement,
    QuestionElement
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ResourcesModule { }
