$(document).ready(()=>{
    loadQueryData();
    loadEditorContent();
    
})

function loadQueryData(){
    var queryData = $('.query-data');
    queryData.each((i)=>{
        var jelement = queryData.eq(i);
        var htmlContent = getQueryData(jelement.attr('type'), jelement.attr('params'));
        jelement.append(htmlContent)
    })
}

function loadEditorContent(){
    var editorClass = $('.editor');
    editorClass.each((i)=>{
        var jelement = editorClass.eq(i);
        var htmlContent = queryEditor(jelement.attr('type'), jelement.attr('params'));
        jelement.append(htmlContent)
    })
}