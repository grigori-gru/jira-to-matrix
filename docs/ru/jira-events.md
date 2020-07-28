# Jira events

## Комментарий

1. Создание комментария в задаче:
    * Добавление комментария в соответствующей комнате в Matrix с текстом:
    ```
    <Автор комментария> добавил комментарий:
    <Текст комментария>
    ```

2. Удаление комментария в задаче:
    * Никаких действий.

3. Редактирвание комментария в задаче:
    * Добавление комментария в соответствующей комнате в Matrix с текстом:
    ```
    <Автор комментария> изменил комментарий:
    <Новый текст комментария>
    ```

## Связь

1. Создание свяязи в задачах:
    * Добавление комментария в обеих соответствующей комнатах в Matrix с текстом:
    ```
    Новая связь, эта задача <тип связи> <ключ задачи> "<тема задачи>"
    ```

2. Удаление связи в задачах:
    * Добавление комментария в обеих соответствующей комнатах в Matrix с текстом:
    ```
    Связь удалена, эта задача  больше не <тип связи> <ключ задачи> "<тема задачи>"
    ```

## Задача

1. Создание задачи:
    * Создание комнаты с названием `<Ключ задачи Название задачи>`, и ссылкой на задачу в топике
    * В первом сообщение следуют поля (`Epic link` при существование у задачи):
        ```
        Assignee:
        <ФИО исполнителя>
        <email>

        Reporter:
        <ФИО автора>
        <email>

        Type:
        <Тип задачи>

        Estimate time:
        <Срок исполнения>

        Description:
        <Описание>

        Priority:
        <Приоритет>

        Epic link
        <Ключ эпика>
        <Ссылка на эпик>
        ```
    * В комнату приглашаются наблюдатели, автор и исполнитель задачи.
    * Следуют уведомление в комнату эпика задачи (если эпик есть) c ссылкой на соответствующую задачу:
    ```
    К эпику добавлена задача <ключ задачи> <название задачи>
    ```

2. Приглашеие нового наблюдателя:
    * В комнату с задачей приглашается соответствующий пользователь Matrix.

3. Добавление/изменение эпика задачи в сущности:
    * В комнату с задачей в Matrix приходит сообщение с изменением .

4. Изменение статуса задачи:
    * В комнату с задачей добавляется сообщение
    ```
    <автор> изменил задачу
    status: <новый статус>
    resolution: Done (только если задача закрыта)
    ```
    * Если есть связь или эпик:
    ```
    <ключ задачи название задачи> теперь в статусе <статус задачи>
    <автор> изменил статус связанной задачи <ключ задачи название задачи ссылка на задачу> на <cтатус задачи>
    ```

5. Изменение ранга задачи (только для next-gen):
    ```
    <автор> изменил задачу
    Rank: Rank lower/higher
    ```

## Эпик

1. Создание эпика:
    * В комнату проекта добавляется сообщение:
    ```
    Новый эпик в проекте
    К проекту добавлен эпик <ключ эпика название эпика ссылка на эпик>
    ```
2. Изменение эпика:
    * В комнату проекта добавляется сообщение:
    ```
    Эпик изменён
    <автор> изменил статус связанного эпика <ключ эпика название эпика ссылка на эпик> на <cтатус эпика>
    ```