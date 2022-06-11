const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
} = require('../../src/model/data/memory/');

describe('in-memory database backend calls', () => {
  test('writeFragment() returns undefined value', async () => {
    const fragment = { ownerId: 'a', id: 'a', metaData: 'abc' };
    await expect(writeFragment(fragment)).resolves.toBe(undefined);
  });

  test('readFragment() returns the metadata that we writeFragment() into the db', async () => {
    const fragment = { ownerId: 'b', id: 'b', metaData: 'abc' };
    await writeFragment(fragment);
    await expect(readFragment(fragment.ownerId, fragment.id)).resolves.toEqual(fragment);
  });

  test('writeFragmentData() returns undefined value', async () => {
    const fragmentData = Buffer.from([1, 2, 3]);
    await expect(writeFragmentData('a', 'a', fragmentData)).resolves.toBe(undefined);
  });

  test('readFragmentData() returns the fragment data that we writeFragmentData() into the db', async () => {
    const fragmentData = Buffer.from([1, 2, 3]);
    await writeFragmentData('b', 'b', fragmentData);
    await expect(readFragmentData('b', 'b')).resolves.toEqual(fragmentData);
  });

  test('listFragments() with empty or false expand argument returns the array of fragment ids', async () => {
    await writeFragment({ ownerId: 'c', id: 'a', metaData: 'abc' });
    await writeFragment({ ownerId: 'c', id: 'b', metaData: 'abc' });
    await writeFragment({ ownerId: 'c', id: 'c', metaData: 'abc' });
    await expect(listFragments('c')).resolves.toEqual(['a', 'b', 'c']);
    await expect(listFragments('c', false)).resolves.toEqual(['a', 'b', 'c']);
  });

  test('listFragments() with expand argument as true returns the array of fragments', async () => {
    await writeFragment({ ownerId: 'd', id: 'a', metaData: 'abc' });
    await writeFragment({ ownerId: 'd', id: 'b', metaData: 'abc' });
    await writeFragment({ ownerId: 'd', id: 'c', metaData: 'abc' });
    await expect(listFragments('d', true)).resolves.toEqual([
      { ownerId: 'd', id: 'a', metaData: 'abc' },
      { ownerId: 'd', id: 'b', metaData: 'abc' },
      { ownerId: 'd', id: 'c', metaData: 'abc' },
    ]);
  });

  test('deleteFragment() deletes the fragment metadata and data', async () => {
    await writeFragment({ ownerId: 'e', id: 'e', metaData: 'abc' });
    await writeFragmentData('e', 'e', Buffer.from([1, 2, 3]));
    await deleteFragment('e', 'e');
    await expect(readFragment('e', 'e')).resolves.toBe(undefined);
    await expect(readFragmentData('e', 'e')).resolves.toBe(undefined);
  });
});
