import { Injectable } from '@angular/core';

import { Surreal } from 'surrealdb/lib/full.js';
import { INNER_DB } from '../constants';
import { ContentEntity } from './content.service';
import { OutcomeEntity } from './outcome.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  #inner_db = new Surreal();

  constructor() {
    (async () => {
      await this.#inner_db.connect(INNER_DB, undefined)
      await this.init()
    })()
  }

  async get<T>(key: ContentEntity | OutcomeEntity, id?: string): Promise<Array<T>> {
    let db: string;

    if (Object.keys(ContentEntity).includes(key)) {
      db = 'content';
    } else if (Object.keys(OutcomeEntity).includes(key)) {
      db = 'outcome';
    }

    try {
      await this.#inner_db.use({ ns: 'test', db })
      return await this.#inner_db.select(key);
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  async set<T>(key: string, content: T): Promise<Array<T>> {
    try {
      await this.#inner_db.use({ ns: 'test', db: 'content' })
      return await this.#inner_db.create(key, content);
    } catch (e) {
      if (e.includes('already exists')) {
        return this.update(key, content);
      } else {
        console.error(e);
        return [];
      }
    }
  }

  async update<T>(key: string, content: T): Promise<Array<T>> {
    try {
      await this.#inner_db.use({ ns: 'test', db: 'content' })
      return await this.#inner_db.update(key, content);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  private async init() {
    // should be just definitions
    await this.#inner_db.use({ ns: 'test', db: 'resources' })
    await this.#inner_db.query(content_dump, undefined)

    await this.#inner_db.use({ ns: 'test', db: 'papers' })
    await this.#inner_db.query(data_dump, undefined)
  }
}

const content_dump = `
-- ------------------------------
-- OPTION
-- ------------------------------

OPTION IMPORT;

-- ------------------------------
-- USERS
-- ------------------------------

DEFINE USER viewer ON DATABASE PASSHASH '$argon2id$v=19$m=19456,t=2,p=1$kRpr22+SeCRuw52dD+Sv3w$bmwKUFRCXXlWXorpT8YofonsHtbDu/DHRwVGpvsIM3U' ROLES VIEWER;

-- ------------------------------
-- PARAMS
-- ------------------------------

DEFINE PARAM $project VALUE projects:x85w529lxx2a3bgfsz11;

-- ------------------------------
-- TABLE: create_locale
-- ------------------------------

DEFINE TABLE create_locale SCHEMALESS PERMISSIONS NONE;

-- ------------------------------
-- TABLE: create_media
-- ------------------------------

DEFINE TABLE create_media SCHEMALESS PERMISSIONS NONE;

-- ------------------------------
-- TABLE: create_question
-- ------------------------------

DEFINE TABLE create_question SCHEMALESS PERMISSIONS NONE;

-- ------------------------------
-- TABLE: create_resource
-- ------------------------------

DEFINE TABLE create_resource SCHEMALESS PERMISSIONS NONE;

-- ------------------------------
-- TABLE: create_slide
-- ------------------------------

DEFINE TABLE create_slide SCHEMALESS PERMISSIONS NONE;

-- ------------------------------
-- TABLE: locales
-- ------------------------------

DEFINE TABLE locales SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD locale ON locales TYPE string;

DEFINE EVENT locales_log ON locales WHEN $event = 'CREATE' OR $event = 'UPDATE' OR $event = 'DELETE' THEN { IF $event = 'DELETE' { CREATE logs SET index = $before.id, event = $event, time = time::now(); } ELSE { CREATE logs SET index = $value.id, event = $event, time = time::now(); }; };
DEFINE EVENT p_create_locale ON locales WHEN $event = 'CREATE' THEN { RELATE $project -> create_locale -> $value; };

-- ------------------------------
-- TABLE: logs
-- ------------------------------

DEFINE TABLE logs SCHEMALESS PERMISSIONS NONE;

-- ------------------------------
-- TABLE: media
-- ------------------------------

DEFINE TABLE media SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD alt ON media TYPE option<string>;
DEFINE FIELD type ON media TYPE string ASSERT $value INSIDE ['image', 'video'];
DEFINE FIELD url ON media TYPE string ASSERT string::is::url($value);

DEFINE EVENT media_log ON media WHEN $event = 'CREATE' OR $event = 'UPDATE' OR $event = 'DELETE' THEN { IF $event = 'DELETE' { CREATE logs SET index = $before.id, event = $event, time = time::now(); } ELSE { CREATE logs SET index = $value.id, event = $event, time = time::now(); }; };
DEFINE EVENT p_create_media ON media WHEN $event = 'CREATE' THEN { RELATE $project -> create_media -> $value; };

-- ------------------------------
-- TABLE: questions
-- ------------------------------

DEFINE TABLE questions SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD question ON questions TYPE array<object> ASSERT array::len($value) < 4 AND array::len($value) > 0;
DEFINE FIELD question[*] ON questions TYPE object;
DEFINE FIELD question[*].content ON questions TYPE string ASSERT $value != EMPTY AND string::len($value) < 250;
DEFINE FIELD question[*].locale ON questions TYPE string ASSERT $value INSIDE (SELECT VALUE locale FROM locales);
DEFINE FIELD range ON questions TYPE option<object> ASSERT $value = NONE OR type = 'range';
DEFINE FIELD range.max ON questions TYPE option<number> ASSERT $value = NONE OR range != NONE;
DEFINE FIELD range.min ON questions TYPE option<number> ASSERT $value = NONE OR range != NONE;
DEFINE FIELD range.value ON questions TYPE option<number> ASSERT $value = NONE OR range != NONE;
DEFINE FIELD type ON questions TYPE string ASSERT $value INSIDE ['range', 'input'];

DEFINE EVENT p_create_question ON questions WHEN $event = 'CREATE' THEN { RELATE $project -> create_question -> $value; };
DEFINE EVENT questions_log ON questions WHEN $event = 'CREATE' OR $event = 'UPDATE' OR $event = 'DELETE' THEN { IF $event = 'DELETE' { CREATE logs SET index = $before.id, event = $event, time = time::now(); } ELSE { CREATE logs SET index = $value.id, event = $event, time = time::now(); }; };

-- ------------------------------
-- TABLE: resources
-- ------------------------------

DEFINE TABLE resources SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD description ON resources TYPE string;
DEFINE FIELD form ON resources TYPE option<array<record>> ASSERT $value = NONE OR type = 'form' AND array::len($value) > 0;
DEFINE FIELD form[*] ON resources TYPE record<questions>;
DEFINE FIELD module ON resources TYPE option<array<record>> ASSERT $value = NONE OR type = 'module' AND array::len($value) > 0;
DEFINE FIELD module[*] ON resources TYPE record<slides>;
DEFINE FIELD ref ON resources TYPE string VALUE string::slug($value) ASSERT $value != EMPTY;
DEFINE FIELD slides ON resources TYPE option<array<record>> ASSERT $value = NONE OR type = 'slides' AND array::len($value) > 0;
DEFINE FIELD slides[*] ON resources TYPE record<slides>;
DEFINE FIELD title ON resources TYPE string ASSERT $value != EMPTY;
DEFINE FIELD type ON resources TYPE string ASSERT $value INSIDE ['slides', 'module', 'form', 'external'];

DEFINE INDEX resources_ref_unique ON resources FIELDS ref UNIQUE;

DEFINE EVENT p_create_resource ON resources WHEN $event = 'CREATE' THEN { RELATE $project -> create_resource -> $value; };
DEFINE EVENT resources_log ON resources WHEN $event = 'CREATE' OR $event = 'UPDATE' OR $event = 'DELETE' THEN { IF $event = 'DELETE' { CREATE logs SET index = $before.id, event = $event, time = time::now(); } ELSE { CREATE logs SET index = $value.id, event = $event, time = time::now(); }; };

-- ------------------------------
-- TABLE: slides
-- ------------------------------

DEFINE TABLE slides SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD content ON slides TYPE option<string>;
DEFINE FIELD media ON slides TYPE option<record<media>>;
DEFINE FIELD question ON slides TYPE option<record<questions>> ASSERT $value = NONE OR (type = 'input' AND questions = NONE);
DEFINE FIELD title ON slides TYPE string;
DEFINE FIELD type ON slides TYPE string ASSERT $value INSIDE ['content', 'input'];

DEFINE EVENT p_create_slide ON slides WHEN $event = 'CREATE' THEN { RELATE $project -> create_slide -> $value; };
DEFINE EVENT slides_log ON slides WHEN $event = 'CREATE' OR $event = 'UPDATE' OR $event = 'DELETE' THEN { IF $event = 'DELETE' { CREATE logs SET index = $before.id, event = $event, time = time::now(); } ELSE { CREATE logs SET index = $value.id, event = $event, time = time::now(); }; };

-- ------------------------------
-- TRANSACTION
-- ------------------------------

BEGIN TRANSACTION;

-- ------------------------------
-- TABLE DATA: create_locale
-- ------------------------------

RELATE projects:x85w529lxx2a3bgfsz11 -> create_locale:h1e4fhzgsw9h27wqy993 -> locales:vu5m35gcrf108dkuq8iw CONTENT { __: true, id: create_locale:h1e4fhzgsw9h27wqy993, in: projects:x85w529lxx2a3bgfsz11, out: locales:vu5m35gcrf108dkuq8iw };
RELATE projects:x85w529lxx2a3bgfsz11 -> create_locale:jjd7z95npqirlc6gmcwk -> locales:3fwllgo7u4uidnoa17ph CONTENT { __: true, id: create_locale:jjd7z95npqirlc6gmcwk, in: projects:x85w529lxx2a3bgfsz11, out: locales:3fwllgo7u4uidnoa17ph };
RELATE projects:x85w529lxx2a3bgfsz11 -> create_locale:q68h1bafppc000xs83q6 -> locales:hg7o4r3iposeju1ui5t4 CONTENT { __: true, id: create_locale:q68h1bafppc000xs83q6, in: projects:x85w529lxx2a3bgfsz11, out: locales:hg7o4r3iposeju1ui5t4 };

-- ------------------------------
-- TABLE DATA: create_media
-- ------------------------------

RELATE projects:x85w529lxx2a3bgfsz11 -> create_media:xelkwi44kbe6qhomb30b -> media:1 CONTENT { __: true, id: create_media:xelkwi44kbe6qhomb30b, in: projects:x85w529lxx2a3bgfsz11, out: media:1 };

-- ------------------------------
-- TABLE DATA: create_question
-- ------------------------------

RELATE projects:x85w529lxx2a3bgfsz11 -> create_question:01zs7ntovxxt4p5b2666 -> questions:4 CONTENT { __: true, id: create_question:01zs7ntovxxt4p5b2666, in: projects:x85w529lxx2a3bgfsz11, out: questions:4 };
RELATE projects:x85w529lxx2a3bgfsz11 -> create_question:7qkfo43e8253xbhnmb4o -> questions:3 CONTENT { __: true, id: create_question:7qkfo43e8253xbhnmb4o, in: projects:x85w529lxx2a3bgfsz11, out: questions:3 };
RELATE projects:x85w529lxx2a3bgfsz11 -> create_question:860t6b2x5fpdscm3m42z -> questions:5 CONTENT { __: true, id: create_question:860t6b2x5fpdscm3m42z, in: projects:x85w529lxx2a3bgfsz11, out: questions:5 };
RELATE projects:x85w529lxx2a3bgfsz11 -> create_question:g3yuxtkz1pwwhk3ufgb2 -> questions:1 CONTENT { __: true, id: create_question:g3yuxtkz1pwwhk3ufgb2, in: projects:x85w529lxx2a3bgfsz11, out: questions:1 };
RELATE projects:x85w529lxx2a3bgfsz11 -> create_question:hnxgyamuvot94yrimybr -> questions:2 CONTENT { __: true, id: create_question:hnxgyamuvot94yrimybr, in: projects:x85w529lxx2a3bgfsz11, out: questions:2 };

-- ------------------------------
-- TABLE DATA: create_resource
-- ------------------------------

RELATE projects:x85w529lxx2a3bgfsz11 -> create_resource:2ym6q4y63s2ibvyxvhlv -> resources:4 CONTENT { __: true, id: create_resource:2ym6q4y63s2ibvyxvhlv, in: projects:x85w529lxx2a3bgfsz11, out: resources:4 };
RELATE projects:x85w529lxx2a3bgfsz11 -> create_resource:a81eyisvq7vcpimsulxl -> resources:3 CONTENT { __: true, id: create_resource:a81eyisvq7vcpimsulxl, in: projects:x85w529lxx2a3bgfsz11, out: resources:3 };
RELATE projects:x85w529lxx2a3bgfsz11 -> create_resource:qtv8bmoqkmmgc54duzfc -> resources:1 CONTENT { __: true, id: create_resource:qtv8bmoqkmmgc54duzfc, in: projects:x85w529lxx2a3bgfsz11, out: resources:1 };
RELATE projects:x85w529lxx2a3bgfsz11 -> create_resource:sogvahv7gpp3e2bq62af -> resources:2 CONTENT { __: true, id: create_resource:sogvahv7gpp3e2bq62af, in: projects:x85w529lxx2a3bgfsz11, out: resources:2 };

-- ------------------------------
-- TABLE DATA: create_slide
-- ------------------------------

RELATE projects:x85w529lxx2a3bgfsz11 -> create_slide:0fz1i2u125j2aublh6r5 -> slides:8 CONTENT { __: true, id: create_slide:0fz1i2u125j2aublh6r5, in: projects:x85w529lxx2a3bgfsz11, out: slides:8 };
RELATE projects:x85w529lxx2a3bgfsz11 -> create_slide:16pvqnzv8vwpmh9yvrcu -> slides:6 CONTENT { __: true, id: create_slide:16pvqnzv8vwpmh9yvrcu, in: projects:x85w529lxx2a3bgfsz11, out: slides:6 };
RELATE projects:x85w529lxx2a3bgfsz11 -> create_slide:3db7hugww716rlqhe17v -> slides:4 CONTENT { __: true, id: create_slide:3db7hugww716rlqhe17v, in: projects:x85w529lxx2a3bgfsz11, out: slides:4 };
RELATE projects:x85w529lxx2a3bgfsz11 -> create_slide:3rycuoer6g5sryx7o8zw -> slides:3 CONTENT { __: true, id: create_slide:3rycuoer6g5sryx7o8zw, in: projects:x85w529lxx2a3bgfsz11, out: slides:3 };
RELATE projects:x85w529lxx2a3bgfsz11 -> create_slide:4dbfwl8nyx48j2471lwm -> slides:7 CONTENT { __: true, id: create_slide:4dbfwl8nyx48j2471lwm, in: projects:x85w529lxx2a3bgfsz11, out: slides:7 };
RELATE projects:x85w529lxx2a3bgfsz11 -> create_slide:65j3mxs4kmahj8dz7has -> slides:2 CONTENT { __: true, id: create_slide:65j3mxs4kmahj8dz7has, in: projects:x85w529lxx2a3bgfsz11, out: slides:2 };
RELATE projects:x85w529lxx2a3bgfsz11 -> create_slide:l03o636ttzw379aoo00c -> slides:5 CONTENT { __: true, id: create_slide:l03o636ttzw379aoo00c, in: projects:x85w529lxx2a3bgfsz11, out: slides:5 };
RELATE projects:x85w529lxx2a3bgfsz11 -> create_slide:ytf7nk4hq98ficfj3725 -> slides:1 CONTENT { __: true, id: create_slide:ytf7nk4hq98ficfj3725, in: projects:x85w529lxx2a3bgfsz11, out: slides:1 };

-- ------------------------------
-- TABLE DATA: locales
-- ------------------------------

UPDATE locales:3fwllgo7u4uidnoa17ph CONTENT { id: locales:3fwllgo7u4uidnoa17ph, locale: 'es' };
UPDATE locales:hg7o4r3iposeju1ui5t4 CONTENT { id: locales:hg7o4r3iposeju1ui5t4, locale: 'vl' };
UPDATE locales:vu5m35gcrf108dkuq8iw CONTENT { id: locales:vu5m35gcrf108dkuq8iw, locale: 'en' };

-- ------------------------------
-- TABLE DATA: logs
-- ------------------------------

UPDATE logs:6lmgwgi0lsj69dj7git6 CONTENT { event: 'CREATE', id: logs:6lmgwgi0lsj69dj7git6, index: resources:2, time: '2023-11-14T14:57:14.925270404Z' };
UPDATE logs:byqqun3yjm3d19k5zzyi CONTENT { event: 'CREATE', id: logs:byqqun3yjm3d19k5zzyi, index: locales:3fwllgo7u4uidnoa17ph, time: '2023-11-14T14:57:14.776661609Z' };
UPDATE logs:c4sf8sq9c5xfj3ahtj73 CONTENT { event: 'CREATE', id: logs:c4sf8sq9c5xfj3ahtj73, index: resources:4, time: '2023-11-14T14:57:14.926007890Z' };
UPDATE logs:dpybid9n7u701x05t3kc CONTENT { event: 'CREATE', id: logs:dpybid9n7u701x05t3kc, index: questions:3, time: '2023-11-14T14:57:14.847522946Z' };
UPDATE logs:dzfaayju4a7dw4qrsyik CONTENT { event: 'CREATE', id: logs:dzfaayju4a7dw4qrsyik, index: media:1, time: '2023-11-14T14:57:14.811093599Z' };
UPDATE logs:ee6dkwlvlufi3ecexjej CONTENT { event: 'CREATE', id: logs:ee6dkwlvlufi3ecexjej, index: slides:8, time: '2023-11-14T14:57:14.887101823Z' };
UPDATE logs:ekcwn9cz41sgez8wl5d2 CONTENT { event: 'CREATE', id: logs:ekcwn9cz41sgez8wl5d2, index: resources:3, time: '2023-11-14T14:57:14.925650703Z' };
UPDATE logs:eq3v1gui9w44almma090 CONTENT { event: 'CREATE', id: logs:eq3v1gui9w44almma090, index: questions:4, time: '2023-11-14T14:57:14.847869987Z' };
UPDATE logs:hyebymio1cjm8a4v6ipd CONTENT { event: 'CREATE', id: logs:hyebymio1cjm8a4v6ipd, index: questions:5, time: '2023-11-14T14:57:14.848238056Z' };
UPDATE logs:ikuha1m89p8awmo5uzm5 CONTENT { event: 'CREATE', id: logs:ikuha1m89p8awmo5uzm5, index: slides:4, time: '2023-11-14T14:57:14.886277938Z' };
UPDATE logs:j1e5xfcwzuvszh5gpcuk CONTENT { event: 'CREATE', id: logs:j1e5xfcwzuvszh5gpcuk, index: slides:1, time: '2023-11-14T14:57:14.885574402Z' };
UPDATE logs:joolgnq99z14s4qkjeun CONTENT { event: 'CREATE', id: logs:joolgnq99z14s4qkjeun, index: questions:1, time: '2023-11-14T14:57:14.846718384Z' };
UPDATE logs:jr4or3flyy317c9aw3jw CONTENT { event: 'CREATE', id: logs:jr4or3flyy317c9aw3jw, index: slides:6, time: '2023-11-14T14:57:14.886694495Z' };
UPDATE logs:lsh7mtefsix6u2k8fl45 CONTENT { event: 'CREATE', id: logs:lsh7mtefsix6u2k8fl45, index: resources:1, time: '2023-11-14T14:57:14.924730570Z' };
UPDATE logs:mzqxaqyex4139pe0y3dq CONTENT { event: 'CREATE', id: logs:mzqxaqyex4139pe0y3dq, index: slides:3, time: '2023-11-14T14:57:14.886066911Z' };
UPDATE logs:q2yjnb3op5xgln7z8n5o CONTENT { event: 'CREATE', id: logs:q2yjnb3op5xgln7z8n5o, index: slides:5, time: '2023-11-14T14:57:14.886480539Z' };
UPDATE logs:uvafiyxrx1e5xydmknsv CONTENT { event: 'CREATE', id: logs:uvafiyxrx1e5xydmknsv, index: slides:7, time: '2023-11-14T14:57:14.886896467Z' };
UPDATE logs:vy00wiptn6qng0tbb0uk CONTENT { event: 'CREATE', id: logs:vy00wiptn6qng0tbb0uk, index: locales:vu5m35gcrf108dkuq8iw, time: '2023-11-14T14:57:14.776758196Z' };
UPDATE logs:w0w89e7t69367dnxjour CONTENT { event: 'CREATE', id: logs:w0w89e7t69367dnxjour, index: questions:2, time: '2023-11-14T14:57:14.847150182Z' };
UPDATE logs:ycap4z86ht3t5bowqpv8 CONTENT { event: 'CREATE', id: logs:ycap4z86ht3t5bowqpv8, index: locales:hg7o4r3iposeju1ui5t4, time: '2023-11-14T14:57:14.776485073Z' };
UPDATE logs:yjmxwu0f7856apiiclk5 CONTENT { event: 'CREATE', id: logs:yjmxwu0f7856apiiclk5, index: slides:2, time: '2023-11-14T14:57:14.885821150Z' };

-- ------------------------------
-- TABLE DATA: media
-- ------------------------------

UPDATE media:1 CONTENT { alt: 'Google logo', id: media:1, type: 'image', url: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png' };

-- ------------------------------
-- TABLE DATA: questions
-- ------------------------------

UPDATE questions:1 CONTENT { id: questions:1, question: [{ content: '¿Con qué frecuencia te sientes capaz de superar con éxito los desafíos?', locale: 'es' }, { content: 'How often do you feel capable of successfully overcoming challenges?', locale: 'en' }], range: { max: 10, min: 0, value: -1 }, type: 'range' };
UPDATE questions:2 CONTENT { id: questions:2, question: [{ content: '¿Con qué frecuencia sientes que tienes el poder para hacer cambios positivos en tu vida?', locale: 'es' }, { content: 'How often do you feel you have the power to make positive changes in your life?', locale: 'en' }], range: { max: 10, min: 0, value: -1 }, type: 'range' };
UPDATE questions:3 CONTENT { id: questions:3, question: [{ content: '¿Con qué frecuencia sientes que puedes tomar decisiones sabias?', locale: 'es' }, { content: 'How often do you feel you are able to make wise decisions?', locale: 'en' }], range: { max: 10, min: 0, value: -1 }, type: 'range' };
UPDATE questions:4 CONTENT { id: questions:4, question: [{ content: '¿Con qué frecuencia te sientes seguro de tu capacidad para alcanzar tus metas?', locale: 'es' }, { content: 'How often do you feel confident in your ability to achieve your goals?', locale: 'en' }], range: { max: 10, min: 0, value: -1 }, type: 'range' };
UPDATE questions:5 CONTENT { id: questions:5, question: [{ content: '¿Con qué frecuencia sientes que tienes la fuerza para mantener la resiliencia en situaciones difíciles?', locale: 'es' }, { content: 'How often do you feel you have the strength to stay resilient in difficult situations?', locale: 'en' }], range: { max: 10, min: 0, value: -1 }, type: 'range' };

-- ------------------------------
-- TABLE DATA: resources
-- ------------------------------

UPDATE resources:1 CONTENT { description: 'This is a module', id: resources:1, module: [slides:1, slides:2, slides:5, slides:7, slides:8], ref: 'module-1', title: 'Module 1', type: 'module' };
UPDATE resources:2 CONTENT { description: 'This is a form', form: [questions:1, questions:2, questions:3, questions:4, questions:5], id: resources:2, ref: 'form-1', title: 'Form 1', type: 'form' };
UPDATE resources:3 CONTENT { description: 'This is a slide two', id: resources:3, ref: 'slides-2', slides: [slides:1, slides:4, slides:5, slides:6], title: 'Slides 2', type: 'slides' };
UPDATE resources:4 CONTENT { description: 'This is a slide one', id: resources:4, ref: 'slides-1', slides: [slides:5, slides:3, slides:7, slides:4], title: 'Slides 1', type: 'slides' };

-- ------------------------------
-- TABLE DATA: slides
-- ------------------------------

UPDATE slides:1 CONTENT { content: 'Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint cillum sint consectetur cupidatat.', id: slides:1, title: 'Slide 3', type: 'content' };
UPDATE slides:2 CONTENT { content: 'Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint cillum sint consectetur cupidatat.', id: slides:2, title: 'Slide 1', type: 'content' };
UPDATE slides:3 CONTENT { id: slides:3, question: questions:1, title: 'Slide 8', type: 'input' };
UPDATE slides:4 CONTENT { id: slides:4, question: questions:2, title: 'Slide 7', type: 'input' };
UPDATE slides:5 CONTENT { content: 'Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint cillum sint consectetur cupidatat.', id: slides:5, title: 'Slide 4', type: 'content' };
UPDATE slides:6 CONTENT { id: slides:6, question: questions:3, title: 'Slide 6', type: 'input' };
UPDATE slides:7 CONTENT { content: 'Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint cillum sint consectetur cupidatat.', id: slides:7, title: 'Slide 5', type: 'content' };
UPDATE slides:8 CONTENT { content: 'Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint cillum sint consectetur cupidatat.', id: slides:8, title: 'Slide 2', type: 'content' };

-- ------------------------------
-- TRANSACTION
-- ------------------------------

COMMIT TRANSACTION;

`;

const data_dump = `
-- ------------------------------
-- OPTION
-- ------------------------------

OPTION IMPORT;

-- ------------------------------
-- USERS
-- ------------------------------

DEFINE USER viewer ON DATABASE PASSHASH '$argon2id$v=19$m=19456,t=2,p=1$obVynAWSX5p9sRrtgFigTw$tctVC1zy076huth0nRzBTVD3WL75VieCxGAng3ZTfyA' ROLES VIEWER;

-- ------------------------------
-- PARAMS
-- ------------------------------

DEFINE PARAM $project VALUE projects:x85w529lxx2a3bgfsz11;

-- ------------------------------
-- TABLE: answers
-- ------------------------------

DEFINE TABLE answers SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD answer ON answers TYPE string;
DEFINE FIELD question ON answers TYPE record<questions>;

DEFINE EVENT answers_log ON answers WHEN $event = 'CREATE' OR $event = 'UPDATE' OR $event = 'DELETE' THEN { IF $event = 'DELETE' { CREATE logs SET index = $before.id, event = $event, time = time::now(); } ELSE { CREATE logs SET index = $value.id, event = $event, time = time::now(); }; };
DEFINE EVENT u_create_answer ON answers WHEN $event = 'CREATE' THEN {
LET $user = $auth.id;
IF $user != NONE { RELATE $user -> create_answer -> $value; };
};

-- ------------------------------
-- TABLE: create_paper
-- ------------------------------

DEFINE TABLE create_paper SCHEMALESS PERMISSIONS NONE;

-- ------------------------------
-- TABLE: logs
-- ------------------------------

DEFINE TABLE logs SCHEMALESS PERMISSIONS NONE;

-- ------------------------------
-- TABLE: papers
-- ------------------------------

DEFINE TABLE papers SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD answers ON papers TYPE option<array<record>> DEFAULT [];
DEFINE FIELD answers[*] ON papers TYPE record<answers>;
DEFINE FIELD completed ON papers TYPE bool DEFAULT false;
DEFINE FIELD resource ON papers TYPE record<resources>;
DEFINE FIELD user ON papers TYPE record<users>;

DEFINE EVENT p_create_paper ON papers WHEN $event = 'CREATE' THEN { RELATE $project -> create_paper -> $value; };
DEFINE EVENT papers_log ON papers WHEN $event = 'CREATE' OR $event = 'UPDATE' OR $event = 'DELETE' THEN { IF $event = 'DELETE' { CREATE logs SET index = $before.id, event = $event, time = time::now(); } ELSE { CREATE logs SET index = $value.id, event = $event, time = time::now(); }; };
DEFINE EVENT u_update_paper ON papers WHEN $event = 'UPDATE' THEN {
LET $user = $auth.id;
IF $user != NONE {
IF $value.completed != $before.completed OR $value.resource != $before.resource OR $value.user != $before.user { THROW 'Update completed is not allowed'; };
fn::on_push($value);
};
fn::on_push($value);
};

-- ------------------------------
-- TABLE: records
-- ------------------------------

DEFINE TABLE records SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD created ON records TYPE datetime DEFAULT time::now();
DEFINE FIELD record ON records FLEXIBLE TYPE object;
DEFINE FIELD user ON records TYPE record<users>;

DEFINE EVENT p_generate_record ON records WHEN $event = 'CREATE' THEN { RELATE $project -> generate_record -> $value; };
DEFINE EVENT records_log ON records WHEN $event = 'CREATE' OR $event = 'UPDATE' OR $event = 'DELETE' THEN { IF $event = 'DELETE' { CREATE logs SET index = $before.id, event = $event, time = time::now(); } ELSE { CREATE logs SET index = $value.id, event = $event, time = time::now(); }; };

-- ------------------------------
-- TABLE: scripts
-- ------------------------------

DEFINE TABLE scripts SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD code ON scripts TYPE string;
DEFINE FIELD name ON scripts TYPE string;

DEFINE INDEX scripts_name ON scripts FIELDS name;

DEFINE EVENT scripts_log ON scripts WHEN $event = 'CREATE' OR $event = 'UPDATE' OR $event = 'DELETE' THEN { IF $event = 'DELETE' { CREATE logs SET index = $before.id, event = $event, time = time::now(); } ELSE { CREATE logs SET index = $value.id, event = $event, time = time::now(); }; };

-- ------------------------------
-- TRANSACTION
-- ------------------------------

BEGIN TRANSACTION;

-- ------------------------------
-- TABLE DATA: answers
-- ------------------------------

UPDATE answers:1 CONTENT { answer: '1', id: answers:1, question: questions:1 };
UPDATE answers:2 CONTENT { answer: '10', id: answers:2, question: questions:2 };

-- ------------------------------
-- TABLE DATA: create_paper
-- ------------------------------

RELATE projects:x85w529lxx2a3bgfsz11 -> create_paper:zhfnl6w8nmfeeotin6cf -> papers:1 CONTENT { __: true, id: create_paper:zhfnl6w8nmfeeotin6cf, in: projects:x85w529lxx2a3bgfsz11, out: papers:1 };

-- ------------------------------
-- TABLE DATA: logs
-- ------------------------------

UPDATE logs:b4o5ep2di2yy2gru3zq6 CONTENT { event: 'CREATE', id: logs:b4o5ep2di2yy2gru3zq6, index: answers:1, time: '2023-11-14T14:57:15.010639420Z' };
UPDATE logs:c77qk9zxcpns172heg33 CONTENT { event: 'CREATE', id: logs:c77qk9zxcpns172heg33, index: scripts:1, time: '2023-11-14T14:57:15.103878518Z' };
UPDATE logs:lotndr6rg2k5x0s5jism CONTENT { event: 'CREATE', id: logs:lotndr6rg2k5x0s5jism, index: answers:2, time: '2023-11-14T14:57:15.010840668Z' };
UPDATE logs:w60n80uo4wps9mco7jm3 CONTENT { event: 'CREATE', id: logs:w60n80uo4wps9mco7jm3, index: papers:1, time: '2023-11-14T14:57:15.047506835Z' };

-- ------------------------------
-- TABLE DATA: papers
-- ------------------------------

UPDATE papers:1 CONTENT { answers: [], completed: false, id: papers:1, resource: resources:1, user: users:1 };

-- ------------------------------
-- TABLE DATA: records
-- ------------------------------


-- ------------------------------
-- TABLE DATA: scripts
-- ------------------------------

UPDATE scripts:1 CONTENT { code: "console.log('hello form function')", id: scripts:1, name: 'push' };

-- ------------------------------
-- TRANSACTION
-- ------------------------------

COMMIT TRANSACTION;

`;
