import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResourcesRoutingModule } from './resources-routing.module';

import { MediaElement } from './elements/media.element';
import { QuestionElement } from './elements/question.element';
import { SliderComponent } from './components/slider/slider.component';
import { ResourcesComponent } from './resources.component';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    SliderComponent,
    ResourcesComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ResourcesRoutingModule
  ],
  providers: [
    MediaElement,
    QuestionElement
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ResourcesModule { }
