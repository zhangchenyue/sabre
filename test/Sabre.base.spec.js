describe('Sabre', function () {

    beforeEach(function () {

    });

    it('should have namespace function', function () {
        expect(typeof Sabre.namespace).toEqual('function');
    });

    it('should have pack function', function () {
        expect(typeof Sabre.pack).toEqual('function');
    });

    it('should have extend function', function () {
        expect(typeof Sabre.extend).toEqual('function');
    });

    it('should have bind function', function () {
        expect(typeof Sabre.bind).toEqual('function');
    });

    it('should have isEmptyObject function', function () {
        expect(typeof Sabre.isEmptyObject).toEqual('function');
    });

    it('should have Class function', function () {
        expect(typeof Sabre.Class).toEqual('function');
    });

    it('should have type Object', function () {
        expect(typeof Sabre.type).toEqual('object');
    });

    //namespace unit test
    describe('namespace', function () {
        beforeEach(function () {
            Sabre.namespace('slb.intract.touch');
        });

        it('should has testNS namespace', function () {
            Sabre.namespace('testNS');
            expect(typeof testNS).toEqual('object');
        });

        it('should has slb namespace', function () {
            expect(typeof slb).toEqual('object');
        });

        it('should has slb.intract namespace', function () {
            expect(typeof slb.intract === 'object').toBeTruthy();
        });

        it('should has slb.intract.touch namespace', function () {
            expect(typeof slb.intract.touch).toEqual('object');
        });
    });

    //pack unit test
    describe('pack', function () {
        beforeEach(function () {
            Sabre.pack('abc', function (S) {
                this.name = 'hello abc';
                S.item = 'bcd'
            });
        });

        it('should create a abc object on global space', function () {
            expect(typeof abc).toEqual('object');
        });

        it('should make abc object has name proprerty', function () {
            expect(abc.name).toEqual('hello abc');
        });

        it('should make Sabre object has item proprerty', function () {
            expect(Sabre.item).toEqual('bcd');
        });
    });

    //binary search unit sest
    describe('binarySearch',function(){
        beforeEach(function(){
           this.testArr = [2,4,6,89,99,120,234,568]; 
        });

        it('should find number 6 at index 2',function(){
            var idx = Sabre.binarySearch(this.testArr, 6);
            expect(idx).toEqual(2);
        })
    });
});
