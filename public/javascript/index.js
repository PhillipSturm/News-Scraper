getArticles = () => {
    $.get('/api/articles').then(articles => {
        // console.log(articles)
        alert('Getting articles from the database.')
        articles.forEach(article => {
            displayArticle(article)
        })
    }).then(() => {
        if ($('#article-section').children().length < 1) {
            alert('No articles found.')
            let emptyMessage = $('<h2>')
            emptyMessage.addClass('empty-message')
            emptyMessage.text('There are no articles saved in the database. Click the Scrape Articles button to scrape news articles.')
            $('#article-section').append(emptyMessage)
        }
    })
}

getArticles()

displayArticle = (article) => {
    let cardDiv = $('<div>')
    cardDiv.addClass('card')
    cardDiv.attr('data-article-id', article._id)
    let cardHeader = $('<div>')
    cardHeader.addClass('card-header bg-primary')
    let articleTitle = $('<h5>')
    articleTitle.text(article.title)
    cardHeader.append(articleTitle)
    let cardBody = $('<div>')
    cardBody.addClass('card-body')
    let articleURL = $('<h6>')
    articleURL.addClass('card-title article-link')
    let URL = $('<a>')
    URL.attr({
        'href': article.url,
        'target': '_blank'
    })
    URL.text('Article Link: ' + article.url)
    articleURL.append(URL)
    let articleSummary = $('<p>')
    articleSummary.addClass('card-text')
    articleSummary.text(article.summary)
    cardBody.append(articleURL, articleSummary)
    let cardFooter = $('<div>')
    cardFooter.addClass('card-footer bg-primary')
    let viewNoteButton = $('<button>')
    viewNoteButton.addClass('btn btn-dark view-notes-button')
    viewNoteButton.attr({
        'data-article-id': article._id,
        'data-toggle': 'modal',
        'data-target': '#article-notes'
    })
    viewNoteButton.text('View Notes')
    let saveArticleButton = $('<button>')
    saveArticleButton.addClass('btn btn-warning save-article-button')
    saveArticleButton.attr({
        'data-article-id': article._id,
        'data-saved': 'unsaved'
    })
    saveArticleButton.text('Save Article')
    let deleteArticleButton = $('<button>')
    deleteArticleButton.addClass('btn btn-danger delete-article-button')
    deleteArticleButton.attr('data-article-id', article._id)
    deleteArticleButton.text('Delete Article')
    cardFooter.append(viewNoteButton, saveArticleButton, deleteArticleButton)
    cardDiv.append(cardHeader, cardBody, cardFooter)
    $('#article-section').append(cardDiv)
}

$('#scrape-articles').on('click', event => {
    event.preventDefault()
    // console.log('Clicked')
    alert('Scraping articles. Please wait.')
    $.get('/api/scrape').then(data => {
        $.get('/api/articles').then(articles => {
            // console.log(articles)
            alert('Scrape Complete')
            $('.empty-message').remove()
            articles.forEach(article => {
                displayArticle(article)
            })
        })
    })
})

$('#clear-articles').on('click', event => {
    event.preventDefault()
    console.log('Clicked')
    $('#article-section').empty()
    let emptyMessage = $('<h2>')
    emptyMessage.addClass('empty-message')
    emptyMessage.text('There are no articles saved in the database. Click the Scrape Articles button to scrape news articles.')
    $('#article-section').append(emptyMessage)
    alert('Articles Cleared!')
})

$(document).on('click', '.save-article-button', event => {
    event.preventDefault()
    // console.log('clicked')
    var target = $(event.currentTarget)
    var id = target.data('article-id')
    // console.log(id)
    $.post(`/api/save/${id}`).then(data => {
        // console.log('Success!')
        // console.log(data)
        // target.text('Unsave Article')
        // target.attr('data-saved', 'saved')
        $("div").find(`[data-article-id='${id}']`).remove()
        alert('Article Saved')
    })
})

$(document).on('click', '.delete-article-button', event => {
    event.preventDefault()
    var target = $(event.currentTarget)
    var id = target.data('article-id')
    $.post(`/api/delete/${id}`).then(data => {
        $("div").find(`[data-article-id='${id}']`).remove()
    })
})

$(document).on('click', '.view-notes-button', event => {
    event.preventDefault()
    $('#add-note-button').remove()
    $('.article-notes-div').empty()
    var target = $(event.currentTarget)
    var id = target.data('article-id')
    let addNoteButton = $('<button>')
    addNoteButton.addClass('btn btn-success')
    addNoteButton.attr({
        'id': 'add-note-button',
        'data-article-id': id
    })
    addNoteButton.text('Add Note')
    $('.add-note-div').append(addNoteButton)
    $.get(`/api/notes/${id}`).then(data => {
        $('.article-notes-div').empty()
        for (let i = 0; i < data.notes.length; i++) {
            // console.log(data.notes[i].text)
            let noteCard = $('<div>')
            noteCard.addClass('card')
            let noteBody = $('<div>')
            noteBody.addClass('card-body')
            noteBody.text(data.notes[i].text)
            let noteFooter = $('<div>')
            noteFooter.addClass('card-footer')
            let deleteNoteButton = $('<button>')
            deleteNoteButton.addClass('btn btn-danger delete-note-button')
            deleteNoteButton.attr('data-article-id', id)
            deleteNoteButton.attr('data-note-id', data.notes[i]._id)
            deleteNoteButton.text('Delete Note')
            noteFooter.append(deleteNoteButton)
            noteCard.append(noteBody, noteFooter)
            $('.article-notes-div').append(noteCard)
        }
        if ($('.article-notes-div').children().length < 1) {
            let emptyMessage = $('<h6>')
            emptyMessage.addClass('empty-message')
            emptyMessage.text('There are no notes saved for this Article. Use the form below to submit a Note for this Article.')
            $('.article-notes-div').append(emptyMessage)
        }
    })
})

$(document).on('click', '#add-note-button', event => {
    event.preventDefault()
    let target = $(event.currentTarget)
    let id = target.data('article-id')
    let note = $('#add-note-textarea').val()
    // console.log(note)
    // $('#add-note-textarea').val('')
    $.post(`/api/note/${id}`, {
        text: note
    }).then(data => {
        $('#add-note-textarea').val('')
        // console.log(data)
        $.get(`/api/notes/${id}`).then(data => {
            $('.article-notes-div').empty()
            for (let i = 0; i < data.notes.length; i++) {
                // console.log(data.notes[i].text)
                let noteCard = $('<div>')
                noteCard.addClass('card')
                let noteBody = $('<div>')
                noteBody.addClass('card-body')
                noteBody.text(data.notes[i].text)
                let noteFooter = $('<div>')
                noteFooter.addClass('card-footer')
                let deleteNoteButton = $('<button>')
                deleteNoteButton.addClass('btn btn-danger delete-note-button')
                deleteNoteButton.attr('data-article-id', id)
                deleteNoteButton.attr('data-note-id', data.notes[i]._id)
                deleteNoteButton.text('Delete Note')
                noteFooter.append(deleteNoteButton)
                noteCard.append(noteBody, noteFooter)
                $('.article-notes-div').append(noteCard)
            }
        })
    })
})

$(document).on('click', '.delete-note-button', event => {
    let target = $(event.currentTarget)
    let articleID = target.data('article-id')
    let noteID = target.data('note-id')
    $.post(`/api/delete/${noteID}/${articleID}`).then(data => {
        if (data === 'Note Deleted') {
            target.closest('.card').remove()
            if ($('.article-notes-div').children().length < 1) {
                let emptyMessage = $('<h6>')
                emptyMessage.addClass('empty-message')
                emptyMessage.text('There are no notes saved for this Article. Use the form below to submit a Note for this Article.')
                $('.article-notes-div').append(emptyMessage)
            }
        }
    })
})
