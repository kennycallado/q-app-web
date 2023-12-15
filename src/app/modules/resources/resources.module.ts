import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResourcesRoutingModule } from './resources-routing.module';

import { QuestionElement } from './elements/question.element';
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
    RouterModule,
    ResourcesRoutingModule
  ],
  providers: [
    QuestionElement
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ResourcesModule { }
