// ==UserScript==
// @name         Test.Dom
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @charset		UTF-8
// @require       http://cdn.bootcss.com/jquery/3.1.0/jquery.min.js
// @require       https://unpkg.com/ajax-hook/dist/ajaxhook.min.js
// @match        https://www.aliexpress.com/*
// @grant        none
// ==/UserScript==

var window_url = window.location.href;
var domain = window.location.host;
var source_url = window_url.split('?')[0];
var info={"source_url":source_url};


 function addXMLRequestCallback(callback){
    var oldSend, i;
    if( XMLHttpRequest.callbacks ) {
        // we've already overridden send() so just add the callback
        XMLHttpRequest.callbacks.push( callback );
    } else {
        // create a callback queue
        XMLHttpRequest.callbacks = [callback];
        // store the native send()
        oldSend = XMLHttpRequest.prototype.send;
        // override the native send()
        XMLHttpRequest.prototype.send = function(){
            // process the callback queue
            // the xhr instance is passed into each callback but seems pretty useless
            // you can't tell what its destination is or call abort() without an error
            // so only really good for logging that a request has happened
            // I could be wrong, I hope so...
            // EDIT: I suppose you could override the onreadystatechange handler though
            for( i = 0; i < XMLHttpRequest.callbacks.length; i++ ) {
                XMLHttpRequest.callbacks[i]( this );
            }
            // call the native send()
            oldSend.apply(this, arguments);
        }
    }
}


(function() {
    'use strict';





    // @run-at context-menu
    // Your code here...




    addXMLRequestCallback( function( xhr ) {
            xhr.addEventListener("load", function(){
                if ( xhr.readyState == 4 && xhr.status == 200 ) {
                     console.log("HOOK > " + xhr.responseURL );
                    if ( xhr.responseURL.includes("getUserInfo.do") ) {
                        console.log(xhr);
                        //debugger;
                        //do something!
                    }
                }
            });
        });







    insert_html();

    //检查DOM是否准备好
    function insert_html(){
        var c=document.querySelector('.categories-main');
        if(c){
            ImportCss();
            popHtml();
        }else{
         return setTimeout(insert_html,2000);
        }
    }


    function ImportCss() {
        var jqueryScriptBlock = document.createElement('style');
        jqueryScriptBlock.type = 'text/css';
        jqueryScriptBlock.innerHTML = ".btn{width: 80px;height: 80px;background-color: red;text-align: center;line-height: 80px;font-size: 16px;margin-bottom: 10px;cursor:pointer;border-radius:40px;} .pop_html{left:20px;top:100px;bottom: 20px;color:#ffffff;overflow: hidden;z-index: 999999;position: fixed;padding:5px;text-align:center;width: 175px;height: 180px;border-bottom-left-radius: 4px;border-bottom-right-radius: 4px;border-top-left-radius: 4px;border-top-right-radius: 4px;} .pop_msg{display:none;background-color: red;width: 100%;height: 60px;z-index: 999999;position: fixed;top: 0px;} .pop_msg .tip{height: 60px;line-height: 60px;font-size: 16px;color: white;width: 480px;text-align: center;margin: auto;font-weight: 600;} .pop_msg span{margin-left: 20px;font-size: 14px;}";
        document.getElementsByTagName('head')[0].appendChild(jqueryScriptBlock);
    }

    function popHtml(){
        console.log("----popHtml-->>>");
        var html=" <div class='pop_html'><div id='btn1' class='btn'>获取数据</div></div>";
        $(document.body).append(html);
        $(document.body).append("<div class='pop_msg'><div class='tip'><span>数据提取失败!</span><a href='http://www.baidu.com' target='_blank'> >>点击查看 </a></div>");
        $("#btn1").click(function(){
            //test_dom();
            console.log("测试脚本提交ajax");
            $.getJSON("/api/getUserInfo.do",function(result){
                console.log(result);
            });
        });
    }

    //aliexpress-info
    function test_dom(){
        var cate=[];
        $(".categories-list-box .cl-item").each(function(k,v){
            var arr1=[];
            $(v).find(".cate-name a").each(function(k3,v3){
                var tmp={};
                var title = $(v3).text();
                var url = $(v3).attr('href');
                var id = url.split('/')[4];
                var tip = url.split('/')[5].replace('.html','')
                //arr1.push({"label":title,"value":id,"tip":tip,"children":[]})
                tmp={"label":title,"value":id,"tip":tip,"url":'https:'+url};
                cate.push(tmp);
            });
            

            /*
            $(v).find(".sub-cate-items").each(function(k2,v2){
                var arr2=[];
                var tmp2={};
                var title2=$(v2).find('dt a').text();
                var url2 = $(v2).find('dt a').attr('href');
                var id2=id,tip2='';
                if(url2.indexOf('category') !=-1){
                    id2 = url2.split('/')[4];
                    var c =url2.split('/')[5];
                    tip2 = c.split('.html')[0];
                }
                tmp2={"label":title2,"value":id2,"tip":tip2,"url":url2,"children":[]};
                $(v2).find("dd a").each(function(k3,v3){
                    var title3 = $(v3).text();
                    var url3 = $(v3).attr('href');
                    var id3='',tip3='';
                    if(url3.indexOf('category') !=-1){
                        id3 = url3.split('/')[4];
                        var c =url3.split('/')[5];
                        tip3 = c.split('.html')[0];
                    }
                    tmp2["children"].push({"label":title3,"value":id3,"tip":tip3});
                });
                tmp["children"].push(tmp2);
            });
*/
            
        });
        console.log(cate);
    }


    //post-data
    function post_data(){
        $.post("https://***.com/api/import/index",{info:info}, function(result){
            console.log(result);
            if(result.retcode==200){
                $(".pop_msg").css("background-color","green");
                $(".pop_msg .tip span").html("数据提取成功!");
                $(".pop_msg .tip a").show();
                $(".pop_msg").show();
            } else {
                $(".pop_msg .tip span").html("数据提取失败!");
                //$(".pop_msg .tip a").hidden();
                $(".pop_msg").show();
            }
            setTimeout(function(){
                $(".pop_msg").fadeOut();
            }, 3000 );
        },"json");
    }

})();
