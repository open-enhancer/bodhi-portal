/**
 * Copyright © 2021 Wuyuan Info Tech Co., Ltd. All rights reserved.
 * License: MIT
 * Site: https://wuyuan.io
 * Author: zyz
 * Updated: 2020/12/30
 * Created: 2017/03/14
 **/

'use strict';

var escape = require('mysql').escape;
var escapeId = require('mysql').escapeId;
var logger = require('log4js').getLogger('io');

var pattern = {
    variableAndIdentifier: /(@(\d+-)?\w+(\.\w+)*@)|(\$(\d+-)?\w+(\.\w+)*\$)/g,
    variable: /@(\d+-)?\w+(\.\w+)*@/g,
    varExp: /(#[^#]+#)|(@(\d+-)?\w+(\.\w+)*@((\.\w+)|(\[\s*\d+\s*\])|(\[\s*'[^']+'\s*\])|(\[\s*"[^"]+"\s*\]))+)/g,
    clientVariable: /(@\d+-\w+(\.\w+)*@)|(\$\d+-\w+(\.\w+)*\$)/g,
    identifier:  /\$(\d+-)?\w+(\.\w+)*\$/g
};

class Service {
    constructor(dbConfig) {
        this.config = dbConfig;
    }
    /**
     * {Function} Criteria Query - This method must be implemented by subclass.
     * @param criteria {Object} Query criteria
     *  eg: {
            id: "d101",
            query: "SELECT * FROM TABLE_$curr_year$ WHERE UID = @user_id@ AND NUM = @12-number@",
            serverVars: {...}
            params: {"1-userid": "zyz"},
            countRecords: true || false,
            metaData: true || false
            filter: {...}, // @see this.__parseFiltersToSqlConditions()
            format: "object" || "array",
            paged: false || true,
            page: 0,
            rownum: 10,
            sortBy: "uid asc, num desc"
        }
     * @param cb {Function} 
        - err
        - result
     */
    criteriaQuery(criteria, cb) {}

    /**
     * {Function} Execute - This method must be implemented by subclass.
     * @param sql {String} The sql which can be executed by database.
     * @param params {Object|Array} The parameters used by sql.
     * @param cb {Function} Callback
     */
    execute(sql, params, cb) {}
    
    /**
     * {Function} beginTransaction
     */
    beginTransaction(cb) {}

    /**
     * {getConnection}
     */
    getConnection(cb) {}

    /**
     * @param criteria - The same as required by query method above.
     * @param paramPlaceHolder {String} This placeholder will replace the variables 
     *    in sql according to different different sql writting in different database.
     * @return executable sql
     */
    prepareSQLStatement(criteria, paramPlaceHolder) {
        // 1. Replace identifier.
        var sql = criteria.query.replace( pattern.identifier, function( s ) {
            var val;
            if ( /\$\w+(\.\w+)*\$/.test(s) ) {
                val = criteria.serverVars[ s.replace(/\$/g, '').toUpperCase() ]
            } else {
                val = criteria.params[ s.replace(/\$/g, '').toUpperCase() ];
            }
            if ( typeof val === "undefined" ) {
                throw new Error( "Lack of parameter: " + s.replace(/\$/g, '') );
            }
            if ( !val ) {
                return "";
            }

            if ( val.length > 64 ) {
                throw new Error( "The length of value of identifier is exceeded. value = '" 
                    + val + "', length = " + val.length + ", max length: 64." );
            }
            if ( !/^\w+(\.\w+)*$/.test( val ) ) {
                throw new Error( "Invalid value injected in SQL: '" + val + "'" );
            }
            return val;
        } );

        // 2. Remove comments.
        sql = sql.replace(/\/\*(.|\s)+?\*\//g, '')
                .replace(/--[^'\n]*('[^'\n]*'[^'\n]*)+/g, '')
                .replace(/'([^'\-\n]*\-[^'\-\n]*)+'/g, function(s) {
                    return s.replace(/-/g, '!@!');
                })
                .replace(/--[^'\n]+/g, '')
                .replace(/!@!/g, '-');

        var params = [];

        // 3. Replace JavaScript such as #@2-RESULT@.data.id + 3#, @12-IMG@.url
        // and caculate the value into params.
        sql = sql.replace(/'[^']'/g, function(s) {
                return s.replace(/#/g, '{SHARP}');
        }).replace(pattern.varExp, function(expr) {
            var exp = expr.replace(/#/g, '');
            exp = '(function(sv, pa){var __ret = '
                    + exp.replace(pattern.variable, function(ss) {
                        var name = ss.split(/\$|\@/)[1];
                        if (/^\w+(\.\w+)*$/.test(name)) {
                            return ' sv["' + name.toUpperCase() + '"]';
                        } else {
                            return ' pa["' + name.toUpperCase() + '"]';
                        }
                    }) + ';return __ret;})';
            var f, vname, ret;
            try {
                f = eval(exp);
            } catch(e) {
                throw new Error('The ' + expr + ' is not a valid JavaScript expression. Caused by: '
                 + e.message);
            }
            try {
                vname = '0-TEMP_VAR_' + Math.round(Math.random() * 10000000);
                ret = f(criteria.serverVars, criteria.params);
                if (typeof ret === 'undefined') {
                    ret = null;
                }
                criteria.params[vname] = ret;
            } catch(e) {
                throw new Error('Error occured when executing '
                    + expr + '. Caused by: '+ e.message);
            }
            return '@' + vname + '@';
        }).replace(/\{SHARP\}/g, function(s) {
            return '#';
        });


        // 4. Replace Variables
        sql = sql.replace( pattern.variable, function( s ) {
            var val;
            if ( /\@\w+(\.\w+)*\@/.test(s) ) {
                val = criteria.serverVars[ s.replace(/\@/g, '').toUpperCase() ]
            } else {
                val = criteria.params[ s.replace(/\@/g, '').toUpperCase() ];
            }

            if ( typeof val === "undefined" ) {
                throw new Error( "Lack of parameter: " + s.replace(/\@/g, '') );
            }
            params.push( val );
            return paramPlaceHolder ? paramPlaceHolder : '?';
        } );

        sql = sql.replace(/;$/, '');

        // 5. Add filters
        var filters = this.__parseFiltersToSqlConditions(criteria.filters);
        
        if ( filters ) {

            // Eliminate where in string
            var sql2 = sql.replace( /'[^']*'/g, 'XXX' );
            
            // Eliminate where clause in nested structure.
            sql2 = sql2.replace(/\([^\(\)]+\)/ig, ' XXX ')
                    .replace(/\([^\(\)]+\)/ig, ' XXX ')
                    .replace(/\([^\(\)]+\)/ig, ' XXX ')
                    .replace(/\([^\(\)]+\)/ig, ' XXX ')
                    .replace(/\([^\(\)]+\)/ig, ' XXX ')
                    .replace(/\([^\(\)]+\)/ig, ' XXX ')
                    .replace(/\([^\(\)]+\)/ig, ' XXX ')
                    .replace(/\([^\(\)]+\)/ig, ' XXX ')
                    .replace(/\([^\(\)]+\)/ig, ' XXX ')
                    .replace(/\([^\(\)]+\)/ig, ' XXX ');

            if ( sql2.search( /\sWHERE\s/i ) === -1  ) {
                sql = sql + ' WHERE ' + filters;
            } else {
                sql = sql + ' AND ( ' + filters + ' )';
            }

            // TODO: handle the union case ...
        }

        criteria.sortBy = criteria.sortBy ? criteria.sortBy.trim() : '';
        if (criteria.sortBy) {
            var sortBy = [];
            var isValid = true;
            criteria.sortBy.split(',').forEach(function(s) {
                s = s.trim();
                var ss = s.split(/\s+/);
                var field = escapeId(ss[0]).replace(/\`/g, '');
                var order = (ss[1] || 'ASC').toUpperCase();
                if (order === 'ASC' || order === 'DESC') {
                    sortBy.push(field + ' ' + order);
                } else {
                    // invalid params
                    isValid = false;
                }
            });
            if (sortBy.length && isValid) {
                criteria.sortBy = sortBy.join(',');
            } else {
                criteria.sortBy = '';
            }
        }

        logger.debug('SQL:\n', sql);
        logger.debug('ORDER BY:', criteria.sortBy);
        logger.debug('PARAMS:\n', JSON.stringify(params));

        return  {
            sql: sql,
            params: params
        };
    }

    /**
     * Parse filters to SQL Conditions
     * @param filters {Object}
     * eg: {
            "groupOp": "OR",   // 条件运算： OR | AND
            "groups": [        // 条件组，相当于 SQL 条件加括号，可以递归地定义下去。
              {
                "groupOp": "OR", 
                "rules": [
                  {
                    "field": "birth_place",
                    "op": "eq",
                    "data": "浙江"
                  }
                ],
                "groups": [...] // 继续嵌套下级
              }
            ],
            "rules": [    // 条件数组，每个元素是一个单独的条件
              {
                "field": "id",  // 字段
                "op": "eq",     // 操作，取值含义对照：
                // eq 等于, ne 不等于, lt 小于, le 小于等于, gt 大于, ge 大于等于, bw 以开头, bn 不以开头,
                // ew 以结尾, en 不以结尾, cn 包含, nc 不包含, nu 为空, nn 不为空, in 在集合中, nn 不在集合中
                "data": 1       //数据
              },
              {
                "field": "id",
                "op": "eq",
                "data": 2
              }
            ]
          }
     * @return {Sting} SQL Conditions
     */
    __parseFiltersToSqlConditions(filters) {
        if (!filters || !filters.groupOp || !filters.rules) {
            return '';
        }
        var that = this;
        var group = filters;
        function parse(group) {
            if (!group || !group.groupOp) {
                return '';
            }
            group.groupOp = {AND: 'AND', OR: 'OR'}[group.groupOp.toUpperCase()]
                || 'AND';

            var conditions = '';
            if (group.rules instanceof Array) {
                conditions = group.rules.map(function(rule) {
                    return that.__parseRuleToSqlCondition(rule);
                }).join(' ' + group.groupOp + ' ');
            }
            if (group.groups instanceof Array && group.groups.length) {
                var gcond = group.groups.map(function(g) {
                        var c = parse(g);
                        return c ? '(' + parse(g) + ')' : '';
                    }).filter(function(r) {
                        return !!r;
                    })
                    .join(' ' + group.groupOp + ' ');
                if (gcond) {
                    conditions = gcond + (conditions ? ' ' + group.groupOp + ' ' + conditions
                                        : '');
                }
            }
            return conditions;
        }
        return parse(group);
    }

    /**
     * Parse rule to SQL condition
     * @param rule {Object} 
        eg: {
            field: 'ID', // Field name
            op: 'eq',    // Operation name
            data: '2312' // Data
        }
     * @return SQL condition
         eg: id = '2313'
     */
    __parseRuleToSqlCondition(rule) {
        if (!rule.field || !rule.op) {
            return ''; 
        }
        rule.field = escapeId(rule.field).replace(/\`/g, '');
        var dataType = typeof rule.data;
        var isNormalType = dataType === 'number'
                    || dataType === 'string'
                    || dataType === 'boolean'
                    || rule.data === null;

        switch (rule.op) {
            case 'eq': 
                return isNormalType 
                    ? rule.field + ' = ' + escape(rule.data)
                    : '';
            case 'is':
                return isNormalType 
                    ? rule.field + ' is ' + escape(rule.data)
                    : '';
            case 'ne':
                return isNormalType 
                    ? rule.field + ' <> ' + escape(rule.data)
                    : '';
            case 'lt':
                return isNormalType 
                    ? rule.field + ' < ' + escape(rule.data)
                    : '';
            case 'le':
                return isNormalType 
                    ? rule.field + ' <= ' + escape(rule.data)
                    : '';
            case 'gt':
                return isNormalType 
                    ? rule.field + ' > ' + escape(rule.data)
                    : '';
            case 'ge':
                return isNormalType 
                    ? rule.field + ' >= ' + escape(rule.data)
                    : '';
            case 'bw': 
                return rule.field
                    + ' LIKE '
                    + escape(rule.data + '%');
            case 'bn':
                return rule.field
                    + ' NOT LIKE '
                    + escape(rule.data + '%');
            case 'ew':
                return rule.field
                    + ' LIKE '
                    + escape('%' + rule.data);
            case 'en':
                return rule.field
                    + ' NOT LIKE '
                    + escape(rule.data + '%');
            case 'cn':
                return rule.field
                    + ' LIKE '
                    + escape('%' + rule.data + '%');
            case 'nc':
                return rule.field
                    + ' NOT LIKE '
                    + escape('%' + rule.data + '%');
            case 'nu':
                return rule.field
                    + ' IS NULL';
            case 'nn':
                return rule.field
                    + ' IS NOT NULL';
            case 'in':
                return rule.field
                    + ' IN ('
                    + (rule.data instanceof Array ? rule.data 
                        : (isNormalType ? [rule.data] : []))
                        .map(function(item) {
                            return escape(item);
                        }).join(',')
                    + ')';
            case 'ni':
                return rule.field
                    + ' NOT IN ('
                    + (rule.data instanceof Array ? rule.data 
                        : (isNormalType ? [rule.data] : [])) 
                        .map(function(item) {
                            return escape(item);
                        }).join(',')
                    + ')';
            default: 
                return '';
        }
    }
    getCountSql(sql, params, paramPlaceHolder) {
        sql = sql.trim();
        if (!sql) {
            return;
        }

        // Eliminate nested structure.
        var sql2 = sql.replace(/\([^\(\)]+\)/ig, ' XXX ')
                .replace(/\([^\(\)]+\)/ig, ' XXX ')
                .replace(/\([^\(\)]+\)/ig, ' XXX ')
                .replace(/\([^\(\)]+\)/ig, ' XXX ')
                .replace(/\([^\(\)]+\)/ig, ' XXX ')
                .replace(/\([^\(\)]+\)/ig, ' XXX ')
                .replace(/\([^\(\)]+\)/ig, ' XXX ')
                .replace(/\([^\(\)]+\)/ig, ' XXX ')
                .replace(/\([^\(\)]+\)/ig, ' XXX ')
                .replace(/\([^\(\)]+\)/ig, ' XXX ');

        if (sql2.search(/\sUNION\s/i) !== -1 || sql2.search(/\sGROUP\sBY\s/i) !== -1) {
            return {
                sql: "SELECT count(*) records FROM (" + sql + ") A",
                params: params
            }
        }

        var tag = 0;
        var found = 0; // Mark the first FROM word is found.
        sql2 = 'SELECT COUNT(*) records FROM ';
        var ret = sql.replace(/SELECT\*/ig, 'SELECT *')
            .replace(/SELECT\(/ig, 'SELECT (')
            .replace(/FROM\(/ig, 'FROM (')
            .split(/(\s?SELECT(\s|\(|\*))|(\sFROM(\s|\())/i)
            .filter(function(l) {
                return !!l;
            });
        ret.forEach(function(l) {
            if (!found && /\s?SELECT(\s|\(|\*)/i.test(l)) {
                tag++;
            } else if (!found && /\sFROM(\s|\()/i.test(l)) {
                tag--;
                if (tag === 0) {
                    found = 1;
                }
            } else if (found) {
                sql2 = sql2 + (l || '');
                return
            }
        });
        
        // Resort params.
        paramPlaceHolder = paramPlaceHolder || '\\\?';
        var pReg = new RegExp(paramPlaceHolder, 'g');
        var countParams = [];
        var num = (sql2.match(pReg) || []).length;
        var len = params.length;
        if (num === len) {
            countParams = params;
        } else {
            for (var i = len - num; i < len; i++) {
                countParams.push(params[i]);
            }
        }

        return {
            sql: sql2,
            params: countParams
        }
    }
};

module.exports = Service;