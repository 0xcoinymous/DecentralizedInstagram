const { assert } = require('chai');

const Instagram = artifacts.require('./Instagram.sol');

require('chai').use(require('chai-as-promised')).should()

contract('Instagram', (accounts) => {
    let Mycontract

    before(async () => {
        Mycontract = await Instagram.deployed()
    })

    describe('deployment', async () => {
        it('deploy successfully', async () => {
            const address = await Mycontract.address

            assert.notEqual(address, 0x0, 'zero address')
            assert.notEqual(address, '', 'khali address')
            assert.notEqual(address, undefined, 'undefined address')
            assert.notEqual(address, null, 'null address')
        })
    })

    describe('Uplod Post', async () => {

        let result, PostCounter
        const hash = "sjkfkjdspoeow51f4s5f5f4ds5f"

        before(async () => {
            result = await Mycontract.UplodPost(hash, 'description Post', '10 Mar 10/25/46', { from: accounts[0] })
            PostCounter = await Mycontract.PostCounter()
        })


        it('Check Post', async () => {

            assert.equal(PostCounter, 1, 'post counter incorrect')

            const event = result.logs[0].args

            assert.equal(event.id.toNumber(), PostCounter, 'id is incorrect')
            assert.equal(event.hashimage, hash, 'hash is incorrect')
            assert.equal(event.description, 'description Post', 'description is incorrect')
            assert.equal(event.author, accounts[0], 'author is incorrect')


            await Mycontract.UplodPost('', 'description Post', '10 Mar 10/25/46', { from: accounts[0] }).should.be.rejected;
            await Mycontract.UplodPost('hash', '', '10 Mar 10/25/46', { from: accounts[0] }).should.be.rejected;

        })

        it('Check list Post', async () => {

            let counter = PostCounter - 1

            const post = await Mycontract.posts(counter)

            assert.equal(post.id.toNumber(), counter, 'id is incorrect')
            assert.equal(post.likeCounter, '0', 'likeCounter is incorrect')
            assert.equal(post.disLikeCounter, '0', 'disLikeCounter is incorrect')
            assert.equal(post.commentCounter, '0', 'commentCounter is incorrect')
            assert.equal(post.tipAmount, '0', 'tipAmount is incorrect')
            assert.equal(post.hashImage, hash, 'hash is incorrect')
            assert.equal(post.description, 'description Post', 'id is incorrect')
            assert.equal(post.date, '10 Mar 10/25/46', 'date is incorrect')
            assert.equal(post.author, accounts[0], 'author is incorrect')

        })
    })


    describe('Add/Sub Like/disLike', async () => {

        let count, post

        before(async () => {
            PostCounter = await Mycontract.PostCounter()
            count = PostCounter - 1
            post = await Mycontract.posts(count)
        })

        it('Add/Sub Like', async () => {

            let likelist

            await Mycontract.AddLike(count, { from: accounts[0] })
            likelist = await Mycontract.getLike(count)

            let postnew = await Mycontract.posts(count)
            assert.equal(postnew.likeCounter.toNumber(), 1, 'likeCounter is incorrect')
            assert.equal(likelist[0], accounts[0], 'accounts is incorrect')

            await Mycontract.SubLike(count, { from: accounts[0] })
            likelist = await Mycontract.getLike(count)


            let postnew2 = await Mycontract.posts(count)
            assert.equal(postnew2.likeCounter.toNumber(), 0, 'likeCounter2 is incorrect')
            assert.equal(likelist[0], undefined, 'accounts2 is incorrect')


        })


        it('Add/Sub disLike', async () => {

            let dislikelist

            await Mycontract.AdddisLike(count, { from: accounts[0] })
            dislikelist = await Mycontract.getdisLike(count)

            let postnew = await Mycontract.posts(count)
            assert.equal(postnew.disLikeCounter.toNumber(), 1, 'dislikeCounter is incorrect')
            assert.equal(dislikelist[0], accounts[0], 'accounts is incorrect')

            await Mycontract.SubdisLike(count, { from: accounts[0] })
            dislikelist = await Mycontract.getdisLike(count)


            let postnew2 = await Mycontract.posts(count)
            assert.equal(postnew2.disLikeCounter.toNumber(), 0, 'dislikeCounter2 is incorrect')
            assert.equal(dislikelist[0], undefined, 'accounts2 is incorrect')


        })
    })


    describe('Add Comment', async () => {

        let result, PostCounter, count, post, commentCounter

        before(async () => {
            PostCounter = await Mycontract.PostCounter()
            count = PostCounter - 1
            result = await Mycontract.AddComment(count, 'Post Comment', '23 Feb 05/45/45', { from: accounts[0] })
            post = await Mycontract.posts(count)
            commentCounter = (post.commentCounter.toNumber()) - 1
        })

        it('Add Comment', async () => {
            const event = result.logs[0].args
            assert.equal(event.idpost.toNumber(), count, 'idpost is Incorrect')
            assert.equal(event.idcomment.toNumber(), commentCounter, 'idcomment is Incorrect')
            assert.equal(event.comment, 'Post Comment', 'Comment is Incorrect')
            assert.equal(event.author, accounts[0], 'author is Incorrect')
        })

        it('List Comment', async () => {

            const Comment = await Mycontract.getComments(count)

            assert.equal(Comment[0].id, commentCounter, 'commentCounter is Incorrect')
            assert.equal(Comment[0].comment, 'Post Comment', 'Post Comment is Incorrect')
            assert.equal(Comment[0].date, '23 Feb 05/45/45', 'date is Incorrect')
            assert.equal(Comment[0].author, accounts[0], 'author is Incorrect')
        })

    })


    describe('Tip Post', async () => {

        let result, PostCounter, count

        before(async () => {
            PostCounter = await Mycontract.PostCounter()
            count = PostCounter - 1
            post = await Mycontract.posts(count)

        })

        it('allow users to tip', async () => {

            result = await Mycontract.TipPosts(count, { from: accounts[0], value: web3.utils.toWei('1', 'Ether') })

            const event = result.logs[0].args


            assert.equal(event.id.toNumber(), count, 'id is Incorrect')
            assert.equal(event.tipamount, '1000000000000000000', 'tipamount is Incorrect')
            assert.equal(event.currentaccount, accounts[0], 'currentaccount is Incorrect')
            assert.equal(event.author, post.author, 'author is Incorrect')
        })

    })

})