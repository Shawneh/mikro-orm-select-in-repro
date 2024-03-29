import { LoadStrategy, OnInit, OneToOne } from '@mikro-orm/core';
import { Entity, MikroORM, PrimaryKey, Property } from '@mikro-orm/sqlite';
import { ObjectId } from 'mongodb';

@Entity({ abstract: true })
export abstract class BaseEntity {
  @PrimaryKey({ type: 'character', length: 24, autoincrement: false })
  _id!: string;

  @OnInit()
  protected generateRecordId() {
    this._id = new ObjectId(this._id).toString();
  }
}

@Entity({
  tableName: '_test_resource',
})
export class _TestResourceEntity extends BaseEntity {
  @Property({ type: 'character varying' })
  entityDirect: any;

  @OneToOne({
    fieldName: 'resource_reference_id',
    cascade: [],
    persist: false,
    entity: () => _TestResourceReferenceEntity,
  })
  resourceReference?: _TestResourceReferenceEntity | null;

  @Property({ type: 'character', length: 24, nullable: true })
  resourceReferenceId?: string;
}

@Entity({
  tableName: '_test_resource_reference',
})
export class _TestResourceReferenceEntity extends BaseEntity {
  @Property({ type: 'character varying' })
  refEntityDirect: any;
}

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    dbName: ':memory:',
    entities: [_TestResourceEntity, _TestResourceReferenceEntity],
    debug: ['query', 'query-params'],
    loadStrategy: LoadStrategy.JOINED,
    allowGlobalContext: true,
  });
  await orm.schema.refreshDatabase();
});

afterAll(async () => {
  await orm.close(true);
});

test('SELECT_IN - .findOne()  - returns populated related property', async () => {
  console.log('SELECT_IN - findOne');
  const _id = new ObjectId().toString();
  const relationId = new ObjectId().toString();
  
  orm.em.create(_TestResourceEntity, {
    _id,
    entityDirect: 'Foo',
    resourceReferenceId: relationId,
    resourceReference: { _id: relationId, refEntityDirect: 'Bar' }
  });

  await orm.em.flush();
  orm.em.clear();

  const _testResource = await orm.em.findOne(_TestResourceEntity, { _id }, {
    fields: [
      '_id',
      'entityDirect',
      'resourceReference.refEntityDirect'
    ],
    strategy: LoadStrategy.SELECT_IN
  });

  expect(_testResource?.entityDirect).toBe('Foo');
  expect(_testResource?.resourceReference?.refEntityDirect).toBe('Bar');
});

test('JOINED    - .findOne()  - returns populated related property', async () => {
  console.log('JOINED - findOne');
  const _id = new ObjectId().toString();
  const relationId = new ObjectId().toString();

  orm.em.create(_TestResourceEntity, {
    _id,
    entityDirect: 'Foo',
    resourceReferenceId: relationId,
    resourceReference: { _id: relationId, refEntityDirect: 'Bar' }
  });

  await orm.em.flush();
  orm.em.clear();

  const _testResource = await orm.em.findOne(_TestResourceEntity, { _id }, {
    fields: [
      '_id',
      'entityDirect',
      'resourceReference.refEntityDirect'
    ],
    strategy: LoadStrategy.JOINED
  });

  expect(_testResource?.entityDirect).toBe('Foo');
  expect(_testResource?.resourceReference?.refEntityDirect).toBe('Bar');
});

test('SELECT_IN - .find()     - returns populated related property', async () => {
  console.log('SELECT_IN - find');
  const _id = new ObjectId().toString();
  const relationId = new ObjectId().toString();
  
  orm.em.create(_TestResourceEntity, {
    _id,
    entityDirect: 'Foo',
    resourceReferenceId: relationId,
    resourceReference: { _id: relationId, refEntityDirect: 'Bar' }
  });

  await orm.em.flush();
  orm.em.clear();

  const [_testResource] = await orm.em.find(_TestResourceEntity, { _id }, {
    fields: [
      '_id',
      'entityDirect',
      'resourceReference.refEntityDirect'
    ],
    strategy: LoadStrategy.SELECT_IN
  });

  expect(_testResource?.entityDirect).toBe('Foo');
  expect(_testResource?.resourceReference?.refEntityDirect).toBe('Bar');
});

test('JOINED    - .find()     - returns populated related property', async () => {
  console.log('JOINED - find');
  const _id = new ObjectId().toString();
  const relationId = new ObjectId().toString();
  
  orm.em.create(_TestResourceEntity, {
    _id,
    entityDirect: 'Foo',
    resourceReferenceId: relationId,
    resourceReference: { _id: relationId, refEntityDirect: 'Bar' }
  });

  await orm.em.flush();
  orm.em.clear();

  const [_testResource] = await orm.em.find(_TestResourceEntity, { _id }, {
    fields: [
      '_id',
      'entityDirect',
      'resourceReference.refEntityDirect'
    ],
    strategy: LoadStrategy.JOINED
  });

  expect(_testResource?.entityDirect).toBe('Foo');
  expect(_testResource?.resourceReference?.refEntityDirect).toBe('Bar');
});
