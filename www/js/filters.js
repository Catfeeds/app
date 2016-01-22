angular.module('gugecc.filters', [])
    .filter('unix', function() {
        return function(input, type) {
            var format = type == 'DAY' ? 'HH:ss' : 'YYYY-MM-DD';
            return moment(input / 1000, 'X').format(format);
        }
    })
    .filter('sum', function() {
        return function(input) {
            var sum = 0;
            _.each(input, function(v) {
                sum += v;
            });
            return sum;
        }
    })
    .filter('energy', function() {
        var energy = {
            'BIZELECTRIC': '商业电',
            'AIRCONDITION': '空调',
            'BIZCOOLINGENERGY': '商用冷量',
            'BIZELECTRIC': '商业电',
            'BIZGAS': '商用煤气',
            'BIZHEATENERGY': '商用热量',
            'BIZOXYGEN': '商业氧气',
            'CHAINBIZELECTRIC': '连锁商业用电	',
            'COLDWATER': '冷水	立方米',
            'COOLINGENERGY': '冷量	',
            'DININGELECTRIC': '餐饮用电	',
            'DIRECTWATER': '直饮水',
            'ELECTRIC': '电	',
            'GAS': '煤气',
            'HEATENERGY': '热量	',
            'HOTELELECTRIC': '宾馆用电',
            'HOTWATER': '热水',
            'OXYGEN': '氧气',
            'WINDENERGY': '风量'
        }
        return function(input) {
            return energy[input] || '';
        }
    })
    .filter('meter', function() {
        return function(t, k) {
            var d = {
                'ELECTRICITYMETER': {
                	name: '电表',
                	channel: 11,
                	icon: '3'
                },
                'COLDWATERMETER': {
                	name: '冷水表',
                	icon: '2'
                },
                'HOTWATERMETER': {
                	name: '热水表',
                	icon: '2'
                },
                'ENERGYMETER': {
                	name: '能量表',
                	icon: '1'
                },
                'TEMPRATURECONTROL': {
                	name: '温控器',
                	icon: '1'
                } 
            };
            return t ? d[t][k] || '3' : '3';
        }
    })
