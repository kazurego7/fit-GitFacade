import * as assert from 'assert';
import simpleGit, { SimpleGit } from 'simple-git';
import * as common from '../../service/common';

let rootPath = '/usr/src/repo/';

suite('swing', () => {
	let git = simpleGit(rootPath + '1_swing');
	test('swing', async () => {
		// b2 に fit-swing すると、ステージング済み・変更あり・git管理されていないファイルが存在しないこと
		assert.strictEqual((await git.branch()).current, 'b3');
		await common.swing(git, 'b2');
		assert.strictEqual((await git.branch()).current, 'b2');
		assert.deepStrictEqual((await git.status()).staged, []);
		assert.deepStrictEqual((await git.status()).modified, []);
		assert.deepStrictEqual((await git.status()).not_added, []);

		// b3 に fit-swing すると、ステージング済み・変更あり・git管理されていないファイルが復元されること
		await common.swing(git, 'b3');
		assert.strictEqual((await git.branch()).current, 'b3');
		assert.deepStrictEqual((await git.status()).staged, ['file1.txt']);
		assert.deepStrictEqual((await git.status()).modified, ['file1.txt', 'file2.txt']);
		assert.deepStrictEqual((await git.status()).not_added, ['file3.txt']);
	});
});
