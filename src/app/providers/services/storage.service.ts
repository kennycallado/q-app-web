import { Injectable, computed, signal } from '@angular/core';

import { Surreal } from 'surrealdb/lib/full.js';

import { INNER_DB } from '../constants';
import { ContentEntity } from './content.service';
import { OutcomeEntity } from './outcome.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  #inner_db = new Surreal();

  #ready = signal(false);
  ready = computed(() => this.#ready());

  constructor() {
    (async () => {
      await this.#inner_db.connect(INNER_DB, { capabilities: true })

      //check if the db is empty
      await this.#inner_db.use({ ns: 'test', db: 'content' })
      if (!await this.#inner_db.select('$project')) await this.init()

      this.#ready.set(true)
    })()
  }

  async query<T>(key: ContentEntity | OutcomeEntity, query: string, params?: any): Promise<Array<T>> {
    let db = this.selectDb(key);

    try {
      await this.#inner_db.use({ ns: 'test', db })
      return await this.#inner_db.query(query, params);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async get<T>(key: ContentEntity | OutcomeEntity, id?: string): Promise<Array<T>> {
    let db = this.selectDb(key);

    try {
      await this.#inner_db.use({ ns: 'test', db })
      return await this.#inner_db.select(key);
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  async set<T>(key: ContentEntity | OutcomeEntity, content: any): Promise<T> {
    let db = this.selectDb(key);

    try {
      await this.#inner_db.use({ ns: 'test', db })
      return await this.#inner_db.create(key, content);
    } catch (e) {
      if (e.includes('already exists')) {
        return this.update<T>(key, content);
      } else {
        console.error(e);
        return;
      }
    }
  }

  async update<T>(key: ContentEntity | OutcomeEntity, content: T): Promise<T> {
    let db = this.selectDb(key);

    try {
      await this.#inner_db.use({ ns: 'test', db })
      return await this.#inner_db.update(key, content);
    } catch (e) {
      console.error(e);
      return;
    }
  }

  private selectDb(key: ContentEntity | OutcomeEntity): string {
    if (Object.keys(ContentEntity).includes(key)) {
      return 'content';
    } else if (Object.keys(OutcomeEntity).includes(key)) {
      return 'outcome';
    }
  }

  private async init() {
    // should be just definitions
    await this.#inner_db.use({ ns: 'test', db: 'content' })
    await this.#inner_db.query(content_dump, undefined)

    await this.#inner_db.use({ ns: 'test', db: 'outcome' })
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

-- ------------------------------
-- TABLE: records
-- ------------------------------

DEFINE TABLE records SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD created ON records TYPE datetime DEFAULT time::now();
DEFINE FIELD record ON records FLEXIBLE TYPE object DEFAULT {};
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
`;
