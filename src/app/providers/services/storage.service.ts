import { Injectable, computed, signal } from '@angular/core';

import { Surreal } from 'surrealdb/lib/full.js';

import { INNER_DB } from '../constants';
import { ContentEntity, OutcomeEntity, ProjectEntity } from '../types';

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
      await this.#inner_db.use({ ns: 'projects', db: 'demo' })
      this.#inner_db.query('USE DB projects; INFO FOR DB;', undefined).then(async (res) => {
        if (res[1][0].tables.projects) {
            this.#ready.set(true)
        } else {
          await this.init()

          this.#ready.set(true)
        }
      })
    })()
  }

  async query<T>(
    key: ContentEntity | OutcomeEntity | ProjectEntity,
    query: string,
    params?: any
  ): Promise<Array<T>> {
    try {
      return await this.#inner_db.query(query, params);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async get<T>(
    key: ContentEntity | OutcomeEntity | ProjectEntity,
    id?: string
  ): Promise<Array<T>> {
    try {
      return await this.#inner_db.select(key);
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  async set<T>(
    key: ContentEntity | OutcomeEntity | ProjectEntity,
    content: any
  ): Promise<T> {
    try {
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

  async update<T>(
    key: ContentEntity | OutcomeEntity | ProjectEntity,
    content: T
  ): Promise<T> {
    try {
      return await this.#inner_db.update(key, content);
    } catch (e) {
      console.error(e);
      return;
    }
  }

  private async init() {
    // should be just definitions
    await this.#inner_db.use({ ns: 'projects', db: 'projects' })
    await this.#inner_db.query(project_dump, undefined)

    await this.#inner_db.use({ ns: 'projects', db: 'demo' })
    // await this.#inner_db.query(content_dump, undefined)
    // await this.#inner_db.query(outcome_dump, undefined)
  }
}

const project_dump = `
-- ------------------------------
-- OPTION
-- ------------------------------

OPTION IMPORT;

-- ------------------------------
-- TABLE: projects
-- ------------------------------

DEFINE TABLE projects SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD name ON projects TYPE string;
DEFINE FIELD state ON projects TYPE string DEFAULT 'development' ASSERT $value INSIDE ['development', 'production'];

DEFINE INDEX projects_name_index ON projects FIELDS name UNIQUE;

DEFINE EVENT projects_log ON projects WHEN $event = 'CREATE' OR $event = 'UPDATE' OR $event = 'DELETE' THEN { IF $event = 'DELETE' { CREATE logs SET index = $before.id, event = $event, time = time::now(); } ELSE { CREATE logs SET index = $value.id, event = $event, time = time::now(); }; };

-- ------------------------------
-- TABLE: users
-- ------------------------------

DEFINE TABLE users SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD active ON users TYPE bool DEFAULT false;
DEFINE FIELD project ON users TYPE record<projects> ASSERT $value INSIDE (SELECT VALUE id FROM projects);

DEFINE EVENT users_log ON users WHEN $event = 'CREATE' OR $event = 'UPDATE' OR $event = 'DELETE' THEN { IF $event = 'DELETE' { CREATE logs SET index = $before.id, event = $event, time = time::now(); } ELSE { CREATE logs SET index = $value.id, event = $event, time = time::now(); }; };
`;

const content_dump = `
-- ------------------------------
-- OPTION
-- ------------------------------

OPTION IMPORT;

-- ------------------------------
-- TABLE: locales
-- ------------------------------

DEFINE TABLE locales SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD locale ON locales TYPE string ASSERT string::len($value) = 2;

DEFINE EVENT locales_log ON locales WHEN $event = 'CREATE' OR $event = 'UPDATE' OR $event = 'DELETE' THEN { IF $event = 'DELETE' { CREATE logs SET index = $before.id, event = $event, time = time::now(); } ELSE { CREATE logs SET index = $value.id, event = $event, time = time::now(); }; };

-- ------------------------------
-- TABLE: media
-- ------------------------------

DEFINE TABLE media SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD alt ON media TYPE option<string>;
DEFINE FIELD type ON media TYPE string ASSERT $value INSIDE ['image', 'video'];
DEFINE FIELD url ON media TYPE string ASSERT string::is::url($value);

DEFINE EVENT media_log ON media WHEN $event = 'CREATE' OR $event = 'UPDATE' OR $event = 'DELETE' THEN { IF $event = 'DELETE' { CREATE logs SET index = $before.id, event = $event, time = time::now(); } ELSE { CREATE logs SET index = $value.id, event = $event, time = time::now(); }; };

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

DEFINE EVENT slides_log ON slides WHEN $event = 'CREATE' OR $event = 'UPDATE' OR $event = 'DELETE' THEN { IF $event = 'DELETE' { CREATE logs SET index = $before.id, event = $event, time = time::now(); } ELSE { CREATE logs SET index = $value.id, event = $event, time = time::now(); }; };
`;

const outcome_dump = `
-- ------------------------------
-- OPTION
-- ------------------------------

OPTION IMPORT;

-- ------------------------------
-- TABLE: answers
-- ------------------------------

DEFINE TABLE answers SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD answer ON answers TYPE string;
DEFINE FIELD question ON answers TYPE record<questions>;

DEFINE EVENT answers_log ON answers WHEN $event = 'CREATE' OR $event = 'UPDATE' OR $event = 'DELETE' THEN { IF $event = 'DELETE' { CREATE logs SET index = $before.id, event = $event, time = time::now(); } ELSE { CREATE logs SET index = $value.id, event = $event, time = time::now(); }; };

-- ------------------------------
-- TABLE: papers
-- ------------------------------

DEFINE TABLE papers SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD answers ON papers TYPE option<array<record>> DEFAULT [];
DEFINE FIELD answers[*] ON papers TYPE record<answers>;
DEFINE FIELD completed ON papers TYPE bool DEFAULT false;
DEFINE FIELD created ON papers TYPE datetime DEFAULT time::now();
DEFINE FIELD resource ON papers TYPE record<resources>;
DEFINE FIELD user ON papers TYPE record<users>;

DEFINE EVENT papers_log ON papers WHEN $event = 'CREATE' OR $event = 'UPDATE' OR $event = 'DELETE' THEN { IF $event = 'DELETE' { CREATE logs SET index = $before.id, event = $event, time = time::now(); } ELSE { CREATE logs SET index = $value.id, event = $event, time = time::now(); }; };
DEFINE EVENT u_update_paper ON papers WHEN $event = 'UPDATE' THEN {
LET $user = $auth.id;
IF $user != NONE {
IF $value.completed != $before.completed OR $value.resource != $before.resource OR $value.user != $before.user {
CREATE logs SET index = $before.id, event = 'ERROR: update not allowed', time = time::now();
THROW 'Changes not allowed';
};
fn::on_push($value);
};
IF $value.completed = false { LET $value = fn::on_push($value); };
};

-- ------------------------------
-- TABLE: scores
-- ------------------------------

DEFINE TABLE scores SCHEMAFULL PERMISSIONS NONE;

DEFINE FIELD created ON scores TYPE datetime DEFAULT time::now();
DEFINE FIELD score ON scores FLEXIBLE TYPE object DEFAULT {  };
DEFINE FIELD user ON scores TYPE record<users>;

DEFINE EVENT scores_log ON scores WHEN $event = 'CREATE' OR $event = 'UPDATE' OR $event = 'DELETE' THEN { IF $event = 'DELETE' { CREATE logs SET index = $before.id, event = $event, time = time::now(); } ELSE { CREATE logs SET index = $value.id, event = $event, time = time::now(); }; };
`;
