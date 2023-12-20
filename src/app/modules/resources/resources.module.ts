import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YouTubePlayerModule } from '@angular/youtube-player';

import { ResourcesRoutingModule } from './resources-routing.module';

import { SliderComponent } from './components/slider/slider.component';
import { ResourcesComponent } from './resources.component';
import { RouterModule } from '@angular/router';
import { MediaComponent } from './components/media/media.component';
import { QuestionComponent } from './components/question/question.component';


@NgModule({
  declarations: [
    SliderComponent,
    ResourcesComponent,
    MediaComponent,
    QuestionComponent,
  ],
  imports: [
    CommonModule,
    YouTubePlayerModule,
    RouterModule,
    ResourcesRoutingModule,
  ],
  providers: [
  ],
  schemas: [
  ]
})
export class ResourcesModule { }
