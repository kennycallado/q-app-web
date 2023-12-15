import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionComponent } from './question.component';

import { QuestionType } from '../../../../providers/models/question.model'

describe('QuestionComponent', () => {
  let component: QuestionComponent;
  let fixture: ComponentFixture<QuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute content based on locale and question', () => {
    component.locale = 'en';
    component.question = {
      id: '1',
      type: QuestionType.Range,
      question: [
        { locale: 'en', content: 'English content' },
        { locale: 'fr', content: 'French content' },
      ],
    };

    expect(component.content).toEqual('English content');
  });

  it('should default to English locale if locale is not set', () => {
    component.locale = null;
    component.question = {
      id: '1',
      type: QuestionType.Range,
      question: [
        { locale: 'en', content: 'English content' },
        { locale: 'fr', content: 'French content' },
      ],
    };

    expect(component.content).toEqual('English content');
  });

  it('should return undefined if no matching locale is found', () => {
    component.locale = 'es';
    component.question = {
      id: '1',
      type: QuestionType.Range,
      question: [
        { locale: 'en', content: 'English content' },
        { locale: 'fr', content: 'French content' },
      ],
    };

    expect(component.content).toBeUndefined();
  });
});
