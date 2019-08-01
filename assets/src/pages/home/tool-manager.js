module.exports = {
    urls: {},
    open: function(actionUrl) {
        $('body').css('overflow', 'hidden');
        var that = this;
        if (!this.$mask) {
            this.$mask = $('<div>').addClass('tool-module-mask').appendTo($('body'))
                .on('click', function() {
                    that.close();
                });
        }
        this.$mask.show();
        if (this.urls[actionUrl]) {
            this.urls[actionUrl].show('drop', 300);
            return
        }
        
        var $toolMode = $('<div>')
                .addClass('tool-module')
                .appendTo($('body'))
                .append($('<iframe>').attr('src', actionUrl));

        $('<i>').addClass('fa fa-times')
            .appendTo($toolMode)
            .on('click', function() {
                that.close();
            });

        this.urls[actionUrl] = $toolMode;
        setTimeout(function() {
            $toolMode.show('drop', 300);
        }, 300);
        
    },
    close: function() {
        $('.tool-module:visible').hide('drop', 300);
        this.$mask.hide();
        $('body').css('overflow', 'unset');
    }
}