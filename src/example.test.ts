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
    allowGlobalContext: true,
  });
  await orm.schema.refreshDatabase();
});

afterAll(async () => {
  await orm.close(true);
});

test('SELECT_IN - .findOne() - returns undefined related property', async () => {
  const _id = new ObjectId().toString();
  const relationId = new ObjectId().toString();
  orm.em.create(_TestResourceEntity, { _id, entityDirect: 'Foo', resourceReference: { _id: relationId, refEntityDirect: 'Bar' } });
  await orm.em.flush();
  orm.em.clear();

  const _testResource = await orm.em.findOneOrFail(_TestResourceEntity, { _id }, {
    fields: [
      '_id',
      'entityDirect',
      'resourceReference.refEntityDirect'
    ],
    strategy: LoadStrategy.SELECT_IN
  });
  console.log('Select In _testResource: ', _testResource);

  expect(_testResource.entityDirect).toBe('Foo');
  expect(_testResource.resourceReference?.refEntityDirect).toBe(undefined);
});

test('JOINED - .findOne() - returns undefined related property', async () => {
  const _id = new ObjectId().toString();
  const relationId = new ObjectId().toString();
  orm.em.create(_TestResourceEntity, { _id, entityDirect: 'Foo', resourceReference: { _id: relationId, refEntityDirect: 'Bar' } });
  await orm.em.flush();
  orm.em.clear();

  const _testResource = await orm.em.findOneOrFail(_TestResourceEntity, { _id }, {
    fields: [
      '_id',
      'entityDirect',
      'resourceReference.refEntityDirect'
    ],
    strategy: LoadStrategy.JOINED
  });
  console.log('Select In _testResource: ', _testResource);

  expect(_testResource.entityDirect).toBe('Foo');
  expect(_testResource.resourceReference?.refEntityDirect).toBe(undefined);
});

test('SELECT_IN - .find() - returns undefined related property', async () => {
  const _id = new ObjectId().toString();
  const relationId = new ObjectId().toString();
  orm.em.create(_TestResourceEntity, { _id, entityDirect: 'Foo', resourceReference: { _id: relationId, refEntityDirect: 'Bar' } });
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
  console.log('Select In _testResource: ', _testResource);

  expect(_testResource?.entityDirect).toBe('Foo');
  expect(_testResource?.resourceReference?.refEntityDirect).toBe(undefined);
});

test('JOINED  - .find() - returns populated related property', async () => {
  const _id = new ObjectId().toString();
  const relationId = new ObjectId().toString();
  orm.em.create(_TestResourceEntity, { _id, entityDirect: 'Foo', resourceReference: { _id: relationId, refEntityDirect: 'Bar' } });
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
  console.log('Joined _testResource: ', _testResource);

  expect(_testResource?.entityDirect).toBe('Foo');
  expect(_testResource?.resourceReference?.refEntityDirect).toBe(undefined);
});
