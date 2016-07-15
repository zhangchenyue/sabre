/* global Sabre */
describe('Sabre.lg', function () {
    it('should have ctDefault object', function () {
        expect(typeof Sabre.lg.CT_DEFAULTS !== 'undefined' && Sabre.lg.CT_DEFAULTS !== null).toBeTruthy();
    });

    it('should have BaseDataManager Class', function () {
        expect(typeof Sabre.lg.BaseDataManager !== 'undefined').toBeTruthy();
    });

    it('should have LocalDataManager as a subClass of BaseDataManager', function () {
        var localDataManager = Sabre.lg.LocalDataManager({ context: this });
        expect(localDataManager instanceof Sabre.lg.BaseDataManager).toBeTruthy();
    });

    describe('UnitConvertor', function () {
        beforeEach(function () {
            this.uc = Sabre.lg.UnitConvertor({ from: 'ft', to: 'm' });
        });

        it('should return 0.3048 when conver from 1ft to 1m', function () {
            expect(0.3048 === this.uc.convert(1)).toBeTruthy();
        });

    });

    describe('Lg3Format', function () {
        beforeEach(function () {
            this.lg3Fmt = Sabre.lg.Lg3Format({ id: '868' });
            this.jFormat = window.fakeDB.template.data['868'];
            this.lg3Fmt.parse(this.jFormat);
        });

        it('should return format channles', function () {
            var channelNames = this.lg3Fmt.getRequiredChannels();
            expect(Object.keys(channelNames).length > 0).toBeTruthy();
        });

        it('should return track width over zero', function () {
            var w = this.lg3Fmt.getWidth();
            expect(w > 0).toBeTruthy();
        });
        
        
        it('should have ft as index unit', function () {
            var indexUnit = this.lg3Fmt.getIndexUnit();
            expect(indexUnit === 'ft').toBeTruthy();
        });
        
         it('should have MEASURED_DEPTH domain', function () {
            var domain = this.lg3Fmt.getDomain();
            expect(!this.lg3Fmt.isTimeDomain()).toBeTruthy();
            expect(!this.lg3Fmt.isTVD()).toBeTruthy();
            expect(domain === 'MEASURED_DEPTH').toBeTruthy();
        });
        
        it('should have scale object in format', function () {
            var scale = this.lg3Fmt.getScaleObj();
            expect(typeof scale.PaperFactor !== 'undefined').toBeTruthy();
            expect(typeof scale.IndexFactor !== 'undefined').toBeTruthy();
        });

    });

    describe('View', function () {
        beforeEach(function () {
            this.lgView = Sabre.lg.View({ id: '#testlgview' });
        });

        it('should has created Sabre.lg.View Class instance', function () {
            expect(this.lgView instanceof Sabre.lg.View).toBeTruthy();
        });

        it('should has body as container', function () {
            expect(this.lgView.container === document.body).toBeTruthy();
        });

        it('should has created instance of LocalDataManager Class by default', function () {
            expect(this.lgView.dataManager instanceof Sabre.lg.LocalDataManager).toBeTruthy();
        });

        it('should call _onPrepareDataCompleted, when start to run', function () {
            spyOn(this.lgView, '_onPrepareDataCompleted');
            this.lgView.run();
            expect(this.lgView._onPrepareDataCompleted).toHaveBeenCalled();
            expect(Sabre.isEmptyObject(this.lgView.prepareDataCompletionFlag)).toBeTruthy();
        });
    });
});