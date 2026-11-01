#!/usr/bin/env python3
"""«Дело недели»: python3 tools/office-cases.py — пересобрать data/office_cases.json и напечатать массив виновных
для office_case_culprit в SQL (порядок дел менять нельзя: номер дела хранится на сервере; новые дела — только в конец
и вместе с новой миграцией, где обновлены число дел в office_case_no и массив виновных).
Виновные в JSON для игры не попадают. Проверяет логику каждого дела:
- виновный не исключён ни одной уликой и имеет все признаки из улик-признаков;
- все улики вместе указывают ровно на одного подозреваемого;
- по одним признакам (без алиби) остаётся не больше двух подозреваемых."""
import json, sys

TR = {
    'sweet': ('🍬', 'сладкоежка', 'sweet tooth'), 'coffee': ('☕', 'кофеман', 'coffee lover'),
    'tea': ('🍵', 'любит чай', 'tea lover'), 'tall': ('🦒', 'высокий рост', 'tall'),
    'short': ('🐭', 'невысокий рост', 'short'), 'early': ('🌅', 'приходит к 8:00', 'early bird'),
    'late': ('🌙', 'сидит допоздна', 'night owl'), 'cold': ('🧶', 'вечно мёрзнет', 'always cold'),
    'hot': ('🥵', 'вечно жарко', 'always hot'), 'glitter': ('✨', 'любит блёстки', 'loves glitter'),
    'cat': ('🐱', 'дома кот', 'has a cat'), 'music': ('🎧', 'в наушниках', 'headphones on'),
    'bike': ('🚲', 'на велосипеде', 'cyclist'), 'plant': ('🌱', 'растит фикусы', 'plant parent'),
    'lefty': ('✋', 'левша', 'left-handed'), 'tech': ('🔧', 'всё чинит сам', 'fixes everything'),
    'red': ('🧣', 'красный шарф', 'red scarf'), 'green': ('🖊', 'зелёная ручка', 'green pen'),
    'gum': ('🍓', 'клубничная жвачка', 'strawberry gum'), 'mint': ('🌿', 'мятные леденцы', 'mint candy'),
    'loud': ('📢', 'громкий голос', 'loud voice'), 'sneak': ('👟', 'белые кроссовки', 'white sneakers'),
    'spicy': ('🌶', 'острый соус', 'hot sauce'), 'photo': ('📸', 'всё фотографирует', 'snaps photos'),
    'puns': ('🤡', 'каламбуры', 'pun lover'),
}
CASES = []
def case(id, ico, t, intro, sus, c, clues):
    CASES.append(dict(id=id, ico=ico, t=t, intro=intro, sus=sus, c=c, clues=clues))
def S(ico, n_ru, n_en, r_ru, r_en, a, b): return dict(ico=ico, n=(n_ru, n_en), r=(r_ru, r_en), tags=[a, b])
def O(i, ru, en): return dict(out=i, t=(ru, en))
def T(tag, ru, en): return dict(tag=tag, t=(ru, en))

case('cake', '🎂', ('Кто съел торт из холодильника?', 'Who ate the cake from the fridge?'),
  ('Бухгалтерия берегла торт до пятницы. В среду от него остались коробка и одинокая вишенка.', 'Accounting was saving the cake for Friday. By Wednesday only the box and one lonely cherry were left.'),
  [S('🚚', 'Гена', 'Gene', 'курьер', 'courier', 'bike', 'sweet'),
   S('🧾', 'Марина Петровна', 'Marina', 'главбух', 'chief accountant', 'tea', 'early'),
   S('🎒', 'Стас', 'Stan', 'стажёр', 'intern', 'sweet', 'music'),
   S('🎨', 'Лиля', 'Lily', 'дизайнер', 'designer', 'glitter', 'coffee'),
   S('🛡', 'Борис', 'Boris', 'охранник', 'security guard', 'late', 'music')], 2,
  [O(0, 'Гена в среду весь день развозил документы по городу — вернулся, когда коробка уже была пустой.', 'Gene spent all Wednesday delivering papers across town and got back when the box was already empty.'),
   O(1, 'Марина Петровна до обеда вела сверку и не вставала из-за стола — это подтверждают три отдела.', 'Marina was reconciling accounts all morning without leaving her desk — three departments confirm it.'),
   O(3, 'Лиля в среду снимала каталог в другом офисе — у неё 40 фото с геометкой.', 'Lily was shooting a catalogue at the other office on Wednesday — 40 geotagged photos prove it.'),
   O(4, 'Борис заступает на смену в 20:00, а торт исчез ещё до обеда.', 'Boris starts his shift at 8 pm, and the cake vanished before lunch.'),
   T('sweet', 'Рядом с коробкой — гора фантиков: здесь пировал настоящий сладкоежка.', 'Next to the box: a pile of candy wrappers. A true sweet tooth was feasting here.'),
   T('sweet', 'Крем выеден аккуратно, а корж почти не тронут — ели ради сладкого.', 'The frosting was carefully eaten, the sponge barely touched — someone was in it for the sugar.'),
   T('music', 'Из кухни доносилось тихое «тыц-тыц»: кто-то ел торт, не снимая наушников.', 'A faint “tss-tss” came from the kitchen: someone ate the cake with headphones on.'),
   T('music', 'На подоконнике кухни забыт кейс от беспроводных наушников.', 'A wireless earbuds case was left on the kitchen windowsill.')])

case('printer', '🖨', ('Кто сломал принтер?', 'Who broke the printer?'),
  ('Принтер на третьем этаже мигает всеми лампочками сразу и печатает только слово «ПОМОГИТЕ».', 'The third-floor printer is blinking every light at once and prints only the word “HELP”.'),
  [S('📈', 'Лёва', 'Leo', 'менеджер по продажам', 'sales manager', 'loud', 'coffee'),
   S('💻', 'Артём', 'Artie', 'разработчик', 'developer', 'tech', 'late'),
   S('📋', 'Вера', 'Vera', 'офис-менеджер', 'office manager', 'early', 'plant'),
   S('🧮', 'Зинаида', 'Zelda', 'бухгалтер', 'accountant', 'green', 'tea'),
   S('🎓', 'Даня', 'Danny', 'аналитик', 'analyst', 'tech', 'lefty')], 4,
  [O(0, 'Лёва в тот вечер был на встрече с клиентом — в CRM есть отметка и фото с ужина.', 'Leo was at a client dinner that evening — there’s a CRM entry and a photo.'),
   O(1, 'Артём сидел допоздна, но на пятом этаже: охрана видела его у кофемашины.', 'Artie stayed late, but on the fifth floor — security saw him at the coffee machine.'),
   O(2, 'Вера ушла в 17:00 ровно: у неё йога, а йогу Вера не пропускает никогда.', 'Vera left at 5 pm sharp: yoga night, and Vera never misses yoga.'),
   O(3, 'Зинаида не пользуется этим принтером из принципа: «Он печатает криво».', 'Zelda refuses to use that printer on principle: “It prints crooked.”'),
   T('tech', 'Крышка принтера снята, винтики разложены по размеру — работал человек, который «сейчас всё починит».', 'The printer cover is off, screws sorted by size — someone who “can fix it real quick” was at work.'),
   T('tech', 'Внутри лежит отвёртка с надписью «моя, не брать».', 'There’s a screwdriver inside labelled “mine, don’t touch”.'),
   T('lefty', 'Отпечатки на лотке — с левой стороны: так берётся за бумагу левша.', 'Fingerprints on the tray are all on the left side — the grip of a left-hander.'),
   T('lefty', 'Мышка у принтерного компьютера переставлена влево.', 'The mouse at the printer’s computer has been moved to the left side.')])

case('ac16', '❄️', ('Кто включил кондиционер на +16?', 'Who set the AC to 61°F?'),
  ('Утром в опенспейсе было +16. Фикусы дрожат, бухгалтерия работает в варежках.', 'This morning the open space was 61°F. The plants are shivering, accounting is typing in mittens.'),
  [S('🏋️', 'Кирилл', 'Kirk', 'фитнес-тренер офиса', 'office fitness coach', 'hot', 'early'),
   S('🧶', 'Тамара', 'Tamara', 'юрист', 'lawyer', 'cold', 'tea'),
   S('🎧', 'Миша', 'Misha', 'саппорт', 'support', 'music', 'hot'),
   S('🌵', 'Ульяна', 'Uliana', 'HR', 'HR', 'plant', 'cold'),
   S('🚲', 'Паша', 'Pasha', 'маркетолог', 'marketer', 'bike', 'sneak')], 0,
  [O(1, 'Тамара пришла в 9:30 в двух свитерах и сразу пошла жаловаться на холод.', 'Tamara arrived at 9:30 in two sweaters and immediately went to complain about the cold.'),
   O(2, 'Миша работает с 11:00 — у него вечерние смены в поддержке.', 'Misha starts at 11 — he works the late support shift.'),
   O(3, 'Ульяна весь день спасала фикусы пледами — ей точно было не до пульта.', 'Uliana spent the day wrapping her plants in blankets — no time for the remote.'),
   O(4, 'Паша приехал на велосипеде в 10:15 и сам удивился холоду.', 'Pasha rode in at 10:15 and was surprised by the cold himself.'),
   T('early', 'Журнал кондиционера: на +16 поставили в 8:04.', 'AC log: set to 61°F at 8:04 am.'),
   T('early', 'Уборщица видела в опенспейсе одного человека ещё до восьми утра.', 'The cleaner saw one person in the open space before 8 am.'),
   T('hot', 'На пульте наклейка: «Мне всегда жарко, не трогать!»', 'A sticker on the remote: “I’m always hot, hands off!”'),
   T('hot', 'Рядом с пультом — веер и пустая бутылка ледяной воды.', 'A hand fan and an empty bottle of ice water lie next to the remote.')])

case('mug', '☕', ('Кто унёс любимую кружку бухгалтерии?', 'Who took Accounting’s favourite mug?'),
  ('Кружка «Лучший бухгалтер вселенной» пропала с сушилки. Квартал под угрозой.', 'The “World’s Best Accountant” mug vanished from the drying rack. The quarter is in danger.'),
  [S('📦', 'Оля', 'Olya', 'логист', 'logistics', 'coffee', 'early'),
   S('🖥', 'Рома', 'Roma', 'сисадмин', 'sysadmin', 'tech', 'coffee'),
   S('📣', 'Жанна', 'Joan', 'PR', 'PR', 'loud', 'photo'),
   S('🧑‍🍳', 'Саша', 'Sasha', 'шеф столовой', 'canteen chef', 'spicy', 'tall'),
   S('🎒', 'Ника', 'Nika', 'стажёр', 'intern', 'coffee', 'cat')], 4,
  [O(0, 'Оля в тот день была в командировке на складе — пила кофе из термоса.', 'Olya was on a warehouse trip that day, drinking coffee from her thermos.'),
   O(1, 'Рома пьёт только из своей кружки «sudo make coffee» и чужие не трогает.', 'Roma only drinks from his “sudo make coffee” mug and never touches others.'),
   O(2, 'Жанна весь день вела прямой эфир — её видели 300 зрителей.', 'Joan was live-streaming all day — 300 viewers saw her.'),
   O(3, 'Саша не заходит на офисную кухню: «У меня своя, профессиональная».', 'Sasha never enters the office kitchen: “I have my own, a professional one.”'),
   T('coffee', 'На сушилке осталось кольцо от крепкого эспрессо.', 'A ring of strong espresso is left on the rack.'),
   T('coffee', 'Кофемашина насчитала в тот день 6 двойных порций в 10:00–11:00 — пил кофеман.', 'The coffee machine logged 6 doubles between 10 and 11 — a coffee lover was here.'),
   T('cat', 'На полке, где стояла кружка, — рыжая кошачья шерсть.', 'Ginger cat hair on the shelf where the mug used to be.'),
   T('cat', 'Рядом найден чек из зоомагазина: «корм для кошек, 2 кг».', 'A pet-store receipt nearby: “cat food, 2 kg”.')])

case('stapler', '📎', ('Кто спрятал красный степлер?', 'Who hid the red stapler?'),
  ('Без красного степлера отчёты не сшиваются, а руководитель грустит. Степлер нашёлся бы, но кто его спрятал?', 'Without the red stapler, reports fall apart and the boss is sad. Who hid it?'),
  [S('📊', 'Игорь Палыч', 'Igor', 'руководитель отдела', 'head of department', 'loud', 'early'),
   S('🧑‍💼', 'Катя', 'Kate', 'ассистент', 'assistant', 'green', 'plant'),
   S('🎤', 'Денис', 'Dennis', 'ведущий корпоративов', 'party host', 'puns', 'red'),
   S('📐', 'Алла', 'Alla', 'архитектор', 'architect', 'lefty', 'tall'),
   S('🧃', 'Тимур', 'Timur', 'стажёр', 'intern', 'gum', 'short')], 2,
  [O(0, 'Игорь Палыч сам ищет степлер с утра и уже объявил награду.', 'Igor has been searching since morning and has already offered a reward.'),
   O(1, 'Катя была на больничном всю неделю — только звонила узнать, как фикусы.', 'Kate was off sick all week — she only called to check on the plants.'),
   O(3, 'Алла была на объекте за городом, у неё есть селфи в каске.', 'Alla was at a construction site out of town — there’s a hard-hat selfie.'),
   O(4, 'Тимур не достаёт до полки, откуда пропал степлер, даже со стулом.', 'Timur can’t reach the shelf where the stapler was, even standing on a chair.'),
   T('red', 'На месте степлера лежит красная ниточка из шарфа.', 'A red scarf thread was found where the stapler used to be.'),
   T('red', 'Камера в коридоре: кто-то в красном шарфе прошёл с подозрительной выпуклостью в кармане.', 'Hallway camera: someone in a red scarf walked by with a suspicious bulge in a pocket.'),
   T('puns', 'Записка на столе: «Не степлер, а сшиватель судеб. Ищите сами!»', 'A note on the desk: “Staple your hopes elsewhere. Find it yourself!”'),
   T('puns', 'Вторая записка: «Кто ищет — тот скрепит». Шутник явно доволен.', 'A second note: “You’ve got to be staple-minded to find it.” The joker is clearly pleased.')])

case('plant', '🌿', ('Кто полил кактус кофе?', 'Who watered the cactus with coffee?'),
  ('Кактус Геннадий, гордость отдела, пахнет латте и выглядит очень бодрым. Подозрительно бодрым.', 'Gennady the cactus, the pride of the team, smells like a latte and looks very awake. Suspiciously awake.'),
  [S('🌱', 'Ульяна', 'Uliana', 'HR', 'HR', 'plant', 'tea'),
   S('💻', 'Влад', 'Vlad', 'тестировщик', 'QA engineer', 'coffee', 'late'),
   S('🎨', 'Соня', 'Sonya', 'дизайнер', 'designer', 'coffee', 'glitter'),
   S('📦', 'Фёдор', 'Fyodor', 'завхоз', 'facilities', 'early', 'tech'),
   S('🎧', 'Лера', 'Lera', 'контент-менеджер', 'content manager', 'music', 'gum')], 1,
  [O(0, 'Ульяна поливает растения только отстоянной водой — у неё график на холодильнике.', 'Uliana only waters plants with settled water — her schedule is on the fridge.'),
   O(2, 'Соня в тот вечер ушла рано: у неё был концерт.', 'Sonya left early that evening for a concert.'),
   O(3, 'Фёдор уходит ровно в 17:00 — а кофе в горшке появился около 22:00.', 'Fyodor leaves at 5 pm sharp — the coffee appeared in the pot around 10 pm.'),
   O(4, 'Лера всю неделю работала из дома.', 'Lera worked from home all week.'),
   T('late', 'Земля в горшке ещё влажная утром — полили поздно вечером.', 'The soil was still wet in the morning — watered late at night.'),
   T('late', 'Последний пропуск на этаже в тот вечер — в 22:40.', 'The last badge swipe on the floor that night was at 10:40 pm.'),
   T('coffee', 'В горшке — капучино с корицей. Кто-то не допил свою третью чашку.', 'It’s a cinnamon cappuccino in the pot. Someone couldn’t finish their third cup.'),
   T('coffee', 'Рядом с кактусом — карта лояльности кофейни с 9 печатями из 10.', 'Next to the cactus: a coffee shop loyalty card with 9 stamps out of 10.')])

case('playlist', '🎵', ('Кто поставил в колонку один и тот же трек 40 раз?', 'Who played the same song 40 times on the speaker?'),
  ('Офисная колонка восьмой час играет одну песню. Половина отдела выучила слова, вторая — заявление на отпуск.', 'The office speaker has played one song for eight hours. Half the team knows the lyrics, the other half wrote leave requests.'),
  [S('🎤', 'Денис', 'Dennis', 'ведущий корпоративов', 'party host', 'loud', 'puns'),
   S('🎧', 'Миша', 'Misha', 'саппорт', 'support', 'music', 'late'),
   S('🧾', 'Марина Петровна', 'Marina', 'главбух', 'chief accountant', 'tea', 'early'),
   S('🎒', 'Ника', 'Nika', 'стажёр', 'intern', 'music', 'glitter'),
   S('📸', 'Жанна', 'Joan', 'PR', 'PR', 'photo', 'glitter')], 3,
  [O(0, 'Денис в тот день вёл корпоратив у клиента — микрофон он из рук не выпускал.', 'Dennis was hosting a client party that day and never let go of the mic.'),
   O(1, 'Миша был на ночной смене и к колонке днём не подходил — спал.', 'Misha was on the night shift and slept through the day.'),
   O(2, 'Марина Петровна дважды просила выключить музыку — пульт ей так и не дали.', 'Marina asked twice to turn the music off — nobody would give her the remote.'),
   O(4, 'Жанна снимала интервью в переговорке со звукоизоляцией.', 'Joan was filming an interview in the soundproof meeting room.'),
   T('music', 'Колонка подключена по Bluetooth к устройству «Наушники-котики».', 'The speaker is paired via Bluetooth to a device called “Kitty Headphones”.'),
   T('music', 'Кто-то переключал колонку на наушники и обратно 12 раз.', 'Someone switched between the speaker and headphones 12 times.'),
   T('glitter', 'На пульте — блёстки. Много блёсток.', 'There’s glitter on the remote. A lot of glitter.'),
   T('glitter', 'У колонки нашёлся блестящий заколка-звёздочка.', 'A sparkly star hairclip was found by the speaker.')])

case('chair', '🪑', ('Кто увёл кресло директора?', 'Who took the director’s chair?'),
  ('Кожаное кресло директора исчезло. Директор работает на табуретке и делает вид, что так и задумано.', 'The director’s leather chair is gone. The director is working on a stool, pretending it was planned.'),
  [S('🦒', 'Алла', 'Alla', 'архитектор', 'architect', 'tall', 'lefty'),
   S('🚲', 'Паша', 'Pasha', 'маркетолог', 'marketer', 'bike', 'sneak'),
   S('🧑‍💻', 'Артём', 'Artie', 'разработчик', 'developer', 'late', 'tech'),
   S('🐭', 'Тимур', 'Timur', 'стажёр', 'intern', 'short', 'gum'),
   S('📢', 'Лёва', 'Leo', 'менеджер по продажам', 'sales manager', 'loud', 'sneak')], 4,
  [O(0, 'Алла в те дни сдавала проект и не выходила из переговорки.', 'Alla was presenting a project and never left the meeting room.'),
   O(2, 'Артём сидит на фитболе и говорит, что кресла — для слабых.', 'Artie sits on a fitness ball and says chairs are for the weak.'),
   O(3, 'Тимур на кресло не сел бы — у него ноги не достают до пола.', 'Timur wouldn’t take it — his feet don’t reach the floor in that chair.'),
   O(1, 'Паша в среду катался на велосипеде на тимбилдинге за городом.', 'Pasha was on a cycling team-building trip out of town on Wednesday.'),
   T('sneak', 'На ковре — следы белых кроссовок от кабинета директора до отдела продаж.', 'White sneaker prints lead from the director’s office to the sales floor.'),
   T('sneak', 'К колёсику кресла прилип белый шнурок.', 'A white shoelace is stuck to a chair wheel.'),
   T('loud', 'Охрана слышала из коридора громкое «Эх, прокачу!».', 'Security heard a loud “Whee, let’s ride!” from the hallway.'),
   T('loud', 'Соседи по этажу жалуются: кто-то громко обсуждал сделку, катаясь в кресле.', 'Neighbours complain someone was loudly closing a deal while rolling around in a chair.')])

case('wifi', '📶', ('Кто поменял пароль от Wi-Fi?', 'Who changed the Wi-Fi password?'),
  ('Новый пароль от Wi-Fi никто не знает. Офис общается голубиной почтой и записками.', 'Nobody knows the new Wi-Fi password. The office is communicating by notes and carrier pigeon.'),
  [S('🖥', 'Рома', 'Roma', 'сисадмин', 'sysadmin', 'tech', 'coffee'),
   S('🤡', 'Денис', 'Dennis', 'ведущий корпоративов', 'party host', 'puns', 'loud'),
   S('🎓', 'Даня', 'Danny', 'аналитик', 'analyst', 'tech', 'puns'),
   S('🧶', 'Тамара', 'Tamara', 'юрист', 'lawyer', 'cold', 'green'),
   S('📋', 'Вера', 'Vera', 'офис-менеджер', 'office manager', 'early', 'plant')], 2,
  [O(0, 'Рома в отпуске на рыбалке — там нет даже мобильной связи.', 'Roma is on a fishing holiday where there isn’t even cell coverage.'),
   O(1, 'Денис не знает, где стоит роутер, и честно спрашивал об этом вчера.', 'Dennis doesn’t know where the router is and honestly asked about it yesterday.'),
   O(3, 'Тамара считает Wi-Fi «юридически сомнительным» и сидит на кабеле.', 'Tamara considers Wi-Fi “legally questionable” and uses a cable.'),
   O(4, 'Вера пыталась подключить принтер к новому Wi-Fi и плакала.', 'Vera tried connecting the printer to the new Wi-Fi and cried.'),
   T('tech', 'В настройках роутера изменения внесены через консоль — новичок бы не справился.', 'The router settings were changed via the console — no beginner could do that.'),
   T('tech', 'На роутере новая прошивка и аккуратно подписанные провода.', 'The router has new firmware and neatly labelled cables.'),
   T('puns', 'Имя новой сети: «Wi-Fight Club». Подсказка: «Первое правило — никому не говорить пароль».', 'New network name: “Wi-Fight Club”. Hint: “First rule — don’t tell anyone the password.”'),
   T('puns', 'Старая сеть переименована в «Скажи пароль и проходи». Каламбурист в деле.', 'The old network was renamed “Say Friend and Enter”. A pun lover strikes again.')])

case('lunch', '🥡', ('Кто съел чужой обед с острым соусом?', 'Who ate someone’s lunch with hot sauce?'),
  ('Из холодильника исчез контейнер «НЕ ТРОГАТЬ. МОЁ». Взамен оставлена записка «Спасибо, было вкусно».', 'A container labelled “DO NOT TOUCH. MINE.” vanished from the fridge. The note left behind: “Thanks, it was delicious.”'),
  [S('🧑‍🍳', 'Саша', 'Sasha', 'шеф столовой', 'canteen chef', 'spicy', 'tall'),
   S('🎒', 'Стас', 'Stan', 'стажёр', 'intern', 'sweet', 'music'),
   S('🧮', 'Зинаида', 'Zelda', 'бухгалтер', 'accountant', 'green', 'tea'),
   S('🔥', 'Мирон', 'Miron', 'продакт', 'product manager', 'spicy', 'lefty'),
   S('🚚', 'Гена', 'Gene', 'курьер', 'courier', 'bike', 'sweet')], 3,
  [O(0, 'Саша в тот день кормил 200 человек в столовой и не отходил от плиты.', 'Sasha fed 200 people in the canteen that day and never left the stove.'),
   O(1, 'Стас не ест острое: от одного запаха перца он плачет.', 'Stan doesn’t eat spicy food — the smell of pepper alone makes him cry.'),
   O(2, 'Зинаида обедает строго в 12:00 и только своими бутербродами.', 'Zelda eats lunch at noon sharp and only her own sandwiches.'),
   O(4, 'Гена обедал в кафе с курьерами — есть общий чек.', 'Gene had lunch at a café with the other couriers — there’s a shared receipt.'),
   T('spicy', 'Записку написали рукой, перепачканной острым соусом.', 'The note was written by a hand smeared with hot sauce.'),
   T('spicy', 'В мусорке — пустая бутылочка самого острого соуса «Пламя дракона».', 'In the bin: an empty bottle of “Dragon Flame”, the hottest sauce around.'),
   T('lefty', 'Почерк на записке наклонён влево — так часто пишут левши.', 'The note’s handwriting slants left — typical for left-handers.'),
   T('lefty', 'Вилку положили в контейнер слева, зубцами к себе.', 'The fork was put back on the left side, prongs facing in.')])

case('meeting', '📅', ('Кто назначил созвон на 8:00 в понедельник?', 'Who booked a call for 8 am on Monday?'),
  ('В календаре всего отдела появилась встреча «Срочно!!!» на понедельник в 8:00. Без повестки.', 'A meeting called “URGENT!!!” appeared in everyone’s calendar for 8 am Monday. No agenda.'),
  [S('🌅', 'Кирилл', 'Kirk', 'фитнес-тренер офиса', 'office fitness coach', 'early', 'hot'),
   S('📊', 'Игорь Палыч', 'Igor', 'руководитель отдела', 'head of department', 'loud', 'early'),
   S('🌙', 'Борис', 'Boris', 'охранник', 'security guard', 'late', 'music'),
   S('🍵', 'Марина Петровна', 'Marina', 'главбух', 'chief accountant', 'tea', 'early'),
   S('💅', 'Вика', 'Vicky', 'маркетолог', 'marketer', 'glitter', 'photo')], 1,
  [O(0, 'Кирилл в 8:00 проводит зарядку и не пропустил бы её ради созвона.', 'Kirk runs the morning workout at 8 and would never skip it for a call.'),
   O(2, 'Борис в 8:00 только сдаёт ночную смену и идёт спать.', 'Boris finishes his night shift at 8 and goes to bed.'),
   O(3, 'Марина Петровна не умеет создавать встречи в календаре — её ассистент подтверждает.', 'Marina doesn’t know how to create calendar events — her assistant confirms.'),
   O(4, 'Вика сама написала в чат: «Кто это?! Я не встаю раньше девяти».', 'Vicky posted in the chat: “Who did this?! I’m never up before nine.”'),
   T('early', 'Приглашение отправлено в 6:47 утра — так рано встают только жаворонки.', 'The invite was sent at 6:47 am — only early birds are up that early.'),
   T('early', 'Камера: в 7:30 на этаже уже кто-то ходил и строил планы на неделю.', 'Camera: someone was already on the floor at 7:30 making plans for the week.'),
   T('loud', 'В описании встречи всё КАПСОМ — автор явно привык говорить громко.', 'The meeting description is ALL CAPS — the author clearly likes to be heard.'),
   T('loud', 'Уборщица слышала через две стены: «ВСЕХ НА СОЗВОН!»', 'The cleaner heard through two walls: “EVERYONE ON THE CALL!”')])

case('cookies', '🍪', ('Кто опустошил вазочку с печеньем?', 'Who emptied the cookie jar?'),
  ('Вазочка для гостей пуста. Гости придут через час. Печенья нет. Свидетелей — тоже.', 'The guests’ cookie jar is empty. Guests arrive in an hour. No cookies. No witnesses.'),
  [S('🎒', 'Ника', 'Nika', 'стажёр', 'intern', 'sweet', 'cat'),
   S('🦒', 'Алла', 'Alla', 'архитектор', 'architect', 'tall', 'coffee'),
   S('🚚', 'Гена', 'Gene', 'курьер', 'courier', 'sweet', 'tall'),
   S('🌿', 'Лена', 'Lena', 'переводчик', 'translator', 'mint', 'short'),
   S('📦', 'Фёдор', 'Fyodor', 'завхоз', 'facilities', 'early', 'tech')], 2,
  [O(0, 'Ника была на собеседовании у руководителя всё утро.', 'Nika was in a review with the manager all morning.'),
   O(1, 'Алла на диете «только кофе до обеда» и гордится этим.', 'Alla is on a “coffee only until lunch” plan and proud of it.'),
   O(3, 'Лена не дотягивается до верхней полки, где стояла вазочка.', 'Lena can’t reach the top shelf where the jar stood.'),
   O(4, 'Фёдор сам покупал это печенье и сейчас в ярости.', 'Fyodor bought those cookies himself and is now furious.'),
   T('tall', 'Вазочку сняли с верхней полки, не воспользовавшись стремянкой.', 'The jar was taken off the top shelf without the step ladder.'),
   T('tall', 'На двери кухни на высоте 190 см — крошки. Кто-то задел её макушкой.', 'Crumbs on the kitchen door at 6’3” — someone bumped it with their head.'),
   T('sweet', 'Овсяное печенье осталось, а шоколадное съедено подчистую.', 'The oatmeal cookies are still there, the chocolate ones are all gone.'),
   T('sweet', 'Рядом пустая пачка зефира — сладкоежка не смог остановиться.', 'An empty marshmallow bag nearby — a sweet tooth couldn’t stop.')])

case('elevator', '🛗', ('Кто нажал все кнопки в лифте?', 'Who pressed every button in the elevator?'),
  ('Утром лифт остановился на всех 14 этажах. Генеральный опоздал на совет директоров.', 'This morning the elevator stopped at all 14 floors. The CEO was late for the board meeting.'),
  [S('🐭', 'Тимур', 'Timur', 'стажёр', 'intern', 'short', 'gum'),
   S('🤡', 'Денис', 'Dennis', 'ведущий корпоративов', 'party host', 'puns', 'red'),
   S('🎓', 'Даня', 'Danny', 'аналитик', 'analyst', 'lefty', 'tech'),
   S('📸', 'Жанна', 'Joan', 'PR', 'PR', 'photo', 'gum'),
   S('🧶', 'Тамара', 'Tamara', 'юрист', 'lawyer', 'cold', 'tea')], 3,
  [O(0, 'Тимур поднимался по лестнице — у него челлендж «10 000 шагов».', 'Timur took the stairs — he’s doing a 10,000-steps challenge.'),
   O(1, 'Денис в то утро застрял в пробке и пришёл к обеду.', 'Dennis was stuck in traffic and arrived at lunchtime.'),
   O(2, 'Даня ехал в соседнем лифте и жаловался, что тот тоже медленный.', 'Danny rode the other elevator and complained it was slow too.'),
   O(4, 'Тамара в лифтах не ездит — боится сквозняков в шахте.', 'Tamara doesn’t use elevators — she’s afraid of drafts in the shaft.'),
   T('gum', 'Кнопки лифта пахнут клубникой.', 'The elevator buttons smell like strawberries.'),
   T('gum', 'На кнопке 14-го этажа — фантик от клубничной жвачки.', 'A strawberry gum wrapper is stuck to the 14th-floor button.'),
   T('photo', 'В соцсетях появилось фото всех горящих кнопок с подписью «Красота!».', 'A photo of all the lit-up buttons appeared online, captioned “Beautiful!”'),
   T('photo', 'В лифте нашли крышку от объектива.', 'A lens cap was found in the elevator.')])

case('sticky', '📝', ('Кто обклеил монитор стикерами?', 'Who covered the monitor in sticky notes?'),
  ('Монитор руководителя покрыт сотней жёлтых стикеров. На каждом — «Ты молодец!». Мило, но работать невозможно.', 'The manager’s monitor is covered in a hundred yellow notes. Each says “You’re doing great!” Sweet, but unusable.'),
  [S('🌱', 'Ульяна', 'Uliana', 'HR', 'HR', 'plant', 'green'),
   S('🧮', 'Зинаида', 'Zelda', 'бухгалтер', 'accountant', 'green', 'early'),
   S('💅', 'Вика', 'Vicky', 'маркетолог', 'marketer', 'glitter', 'photo'),
   S('🧑‍💻', 'Артём', 'Artie', 'разработчик', 'developer', 'late', 'tech'),
   S('🧑‍💼', 'Катя', 'Kate', 'ассистент', 'assistant', 'late', 'plant')], 0,
  [O(1, 'Зинаида считает стикеры «нецелевым расходом» и пишет только в журнал.', 'Zelda considers sticky notes “an unauthorised expense” and only writes in a ledger.'),
   O(2, 'Вика написала бы с блёстками — а тут ни одной блёстки.', 'Vicky would have used glitter — and there isn’t a single sparkle.'),
   O(3, 'Артём в тот вечер чинил сервер и не выходил из серверной.', 'Artie was fixing a server all evening and never left the server room.'),
   O(4, 'Катя была на вечернем курсе английского, есть сертификат с датой.', 'Kate was at an evening English class — there’s a dated certificate.'),
   T('green', 'Все «Ты молодец!» написаны зелёной ручкой.', 'Every “You’re doing great!” is written in green ink.'),
   T('green', 'В урне — зелёный стержень, исписанный до конца.', 'A green pen refill, completely used up, is in the bin.'),
   T('plant', 'Пара стикеров приклеена к листьям фикуса: «Ты тоже молодец!».', 'A couple of notes are stuck on the plant leaves: “You’re great too!”'),
   T('plant', 'На клавиатуре — земля из цветочного горшка.', 'There’s potting soil on the keyboard.')])

case('parking', '🚗', ('Кто занял место гендиректора на парковке?', 'Who took the CEO’s parking spot?'),
  ('На месте гендиректора стоит велосипед, пристёгнутый к табличке «Только для генерального».', 'A bicycle is chained to the “CEO Only” sign in the CEO’s parking spot.'),
  [S('🚲', 'Паша', 'Pasha', 'маркетолог', 'marketer', 'bike', 'sneak'),
   S('🚚', 'Гена', 'Gene', 'курьер', 'courier', 'bike', 'red'),
   S('🏋️', 'Кирилл', 'Kirk', 'фитнес-тренер офиса', 'office fitness coach', 'early', 'sneak'),
   S('🎧', 'Лера', 'Lera', 'контент-менеджер', 'content manager', 'music', 'gum'),
   S('📊', 'Игорь Палыч', 'Igor', 'руководитель отдела', 'head of department', 'loud', 'early')], 0,
  [O(1, 'Велосипед Гены в ремонте всю неделю — он ездит на самокате.', 'Gene’s bike has been in the repair shop all week — he’s using a scooter.'),
   O(2, 'Кирилл приходит пешком: «Ходьба — лучшая разминка».', 'Kirk walks to work: “Walking is the best warm-up.”'),
   O(3, 'Лера не умеет кататься на велосипеде и честно этого стесняется.', 'Lera can’t ride a bike and is honestly a bit shy about it.'),
   O(4, 'Игорь Палыч приезжает на метро и вообще не знал, где парковка.', 'Igor commutes by metro and didn’t even know where the parking lot is.'),
   T('bike', 'Велосипедный замок — с кодом, а код записан в телефоне владельца. Владелец — велосипедист со стажем.', 'The bike lock is a combo lock — and its owner clearly rides every day.'),
   T('bike', 'Охранник видел, как кто-то въехал на парковку, звеня звонком.', 'The guard saw someone ride into the lot ringing a bell.'),
   T('sneak', 'На педалях — белые следы от подошвы кроссовок.', 'White sneaker sole marks are on the pedals.'),
   T('sneak', 'В холле стоит лужица и отпечатки белых кроссовок.', 'There’s a puddle in the lobby and white sneaker prints.')])

case('photo', '🖼', ('Кто повесил свой портрет на доску почёта?', 'Who hung their own portrait on the Wall of Fame?'),
  ('На доске почёта появился новый сотрудник месяца. Его никто не выбирал, но портрет очень удачный.', 'A new Employee of the Month appeared on the Wall of Fame. Nobody voted, but it’s a great portrait.'),
  [S('📸', 'Жанна', 'Joan', 'PR', 'PR', 'photo', 'loud'),
   S('💅', 'Вика', 'Vicky', 'маркетолог', 'marketer', 'photo', 'glitter'),
   S('🦒', 'Алла', 'Alla', 'архитектор', 'architect', 'tall', 'lefty'),
   S('🎤', 'Денис', 'Dennis', 'ведущий корпоративов', 'party host', 'puns', 'glitter'),
   S('🧑‍🍳', 'Саша', 'Sasha', 'шеф столовой', 'canteen chef', 'spicy', 'early')], 1,
  [O(0, 'Жанна в тот день была на конференции в другом городе.', 'Joan was at a conference in another city that day.'),
   O(2, 'Алла сказала, что «такая рамка нарушает композицию стены», и ушла.', 'Alla said “that frame ruins the wall’s composition” and walked away.'),
   O(3, 'Денис уже на доске почёта с прошлого года — второй портрет ему ни к чему.', 'Dennis has been on the Wall since last year — he doesn’t need another portrait.'),
   O(4, 'Саша весь день готовил банкет и пах луком, а не славой.', 'Sasha spent the day catering a banquet and smelled of onions, not glory.'),
   T('photo', 'Фото сделано профессионально: свет, ретушь, три дубля в телефоне.', 'The photo is professional: lighting, retouching, three takes.'),
   T('photo', 'На принтере осталось 12 вариантов этого же портрета.', '12 versions of the same portrait are still in the printer tray.'),
   T('glitter', 'Рамка обклеена блёстками.', 'The frame is covered in glitter.'),
   T('glitter', 'Под доской почёта — рассыпанные блёстки.', 'Glitter is sprinkled on the floor under the Wall.')])

case('fishtank', '🐠', ('Кто переименовал рыбок в аквариуме?', 'Who renamed the fish in the office tank?'),
  ('На аквариуме новые таблички: рыбок теперь зовут «Квартальный», «Годовой» и «Дедлайн».', 'New labels on the tank: the fish are now called “Q3 Report”, “Annual Review” and “Deadline”.'),
  [S('🧮', 'Зинаида', 'Zelda', 'бухгалтер', 'accountant', 'green', 'tea'),
   S('🤡', 'Денис', 'Dennis', 'ведущий корпоративов', 'party host', 'puns', 'loud'),
   S('🐱', 'Ника', 'Nika', 'стажёр', 'intern', 'cat', 'sweet'),
   S('🎓', 'Даня', 'Danny', 'аналитик', 'analyst', 'puns', 'green'),
   S('📋', 'Вера', 'Vera', 'офис-менеджер', 'office manager', 'plant', 'early')], 3,
  [O(0, 'Зинаида уверена, что у рыбок не может быть имён, «только инвентарные номера».', 'Zelda believes fish can’t have names, “only inventory numbers”.'),
   O(1, 'Денис был на выездном корпоративе всю неделю.', 'Dennis was at an offsite party all week.'),
   O(2, 'Ника обходит аквариум стороной: её кот дома ревнует к рыбкам.', 'Nika avoids the tank: her cat at home gets jealous of fish.'),
   O(4, 'Вера сама кормит рыбок и звала их по-старому — Буль, Пуль и Валера.', 'Vera feeds the fish herself and called them by their old names — Bubbles, Pebbles and Kevin.'),
   T('green', 'Таблички написаны зелёной ручкой.', 'The labels are written in green pen.'),
   T('green', 'У аквариума лежит колпачок от зелёной ручки.', 'A green pen cap is lying by the tank.'),
   T('puns', 'На обороте таблички: «Рыбка «Дедлайн» всегда плывёт навстречу».', 'On the back of a label: “Deadline the fish is always coming at you.”'),
   T('puns', 'Под аквариумом записка: «Не бойтесь, у них всё под контролем — у них же есть чешуя… то есть отчётность».', 'A note under the tank: “Don’t worry, they’re on top of it — they have scales. Of performance.”')])

case('fridge', '🧊', ('Кто устроил генеральную уборку холодильника?', 'Who deep-cleaned the office fridge?'),
  ('Холодильник сияет, все контейнеры подписаны, а просроченный йогурт 2019 года исчез. Офис в шоке и благодарности.', 'The fridge is spotless, every container labelled, and the 2019 yogurt is gone. The office is shocked and grateful.'),
  [S('📦', 'Фёдор', 'Fyodor', 'завхоз', 'facilities', 'early', 'tech'),
   S('🌿', 'Лена', 'Lena', 'переводчик', 'translator', 'mint', 'green'),
   S('🎧', 'Миша', 'Misha', 'саппорт', 'support', 'music', 'late'),
   S('🧑‍💼', 'Катя', 'Kate', 'ассистент', 'assistant', 'mint', 'early'),
   S('🔥', 'Мирон', 'Miron', 'продакт', 'product manager', 'spicy', 'coffee')], 3,
  [O(0, 'Фёдор был на складе — принимал новые стулья.', 'Fyodor was at the warehouse receiving new chairs.'),
   O(1, 'Лена работала на выставке переводчиком весь день.', 'Lena was interpreting at an expo all day.'),
   O(2, 'Миша пришёл к 11, а холодильник сиял уже в 9.', 'Misha came in at 11, and the fridge was already gleaming at 9.'),
   O(4, 'Мирон сам искал свой острый соус и очень расстроился, что его подписали «Мирона — не трогать».', 'Miron was looking for his hot sauce and was upset to find it labelled “Miron’s — don’t touch.”'),
   T('early', 'Уборка закончилась до 8:30 — значит, начали очень рано.', 'The cleaning was done by 8:30 — so it started very early.'),
   T('early', 'Первый пропуск в тот день — в 7:52.', 'The first badge swipe that day was at 7:52.'),
   T('mint', 'Холодильник пахнет мятой, хотя средство для мытья — лимонное.', 'The fridge smells of mint, though the cleaner was lemon-scented.'),
   T('mint', 'На полке забыта коробочка мятных леденцов.', 'A tin of mint candies was left on a shelf.')])

case('memes', '😂', ('Кто вывел мем на большой экран переговорки?', 'Who put a meme on the meeting-room screen?'),
  ('На презентации для инвесторов вместо графика выручки появился кот в галстуке. Инвесторы, кстати, в восторге.', 'During the investor pitch, a cat in a tie appeared instead of the revenue chart. The investors loved it.'),
  [S('🐱', 'Ника', 'Nika', 'стажёр', 'intern', 'cat', 'music'),
   S('🖥', 'Рома', 'Roma', 'сисадмин', 'sysadmin', 'tech', 'cat'),
   S('💅', 'Вика', 'Vicky', 'маркетолог', 'marketer', 'glitter', 'photo'),
   S('📊', 'Игорь Палыч', 'Igor', 'руководитель отдела', 'head of department', 'loud', 'tea'),
   S('🎓', 'Даня', 'Danny', 'аналитик', 'analyst', 'tech', 'lefty')], 1,
  [O(0, 'Ника сидела в переговорке рядом с инвесторами и чуть не упала от смеха — не она.', 'Nika was sitting with the investors and nearly fell off her chair laughing — not her.'),
   O(2, 'Вика готовила слайды, но её ноутбук к экрану не подключали.', 'Vicky made the slides, but her laptop was never connected to the screen.'),
   O(3, 'Игорь Палыч вёл презентацию и покраснел до ушей.', 'Igor was presenting and turned bright red.'),
   O(4, 'Даня был на больничном и смотрел презентацию по видео.', 'Danny was off sick and watched over video.'),
   T('tech', 'Мем выведен через удалённый доступ к экрану — нужен пароль администратора.', 'The meme was pushed via remote screen access — admin password required.'),
   T('tech', 'В журнале системы — команда, которую знают только технари.', 'The system log shows a command only techies would know.'),
   T('cat', 'Кот на меме — настоящий, домашний, фото снято на диване.', 'The cat in the meme is a real pet, photographed on a sofa.'),
   T('cat', 'Файл назывался «мой_Барсик_в_галстуке.jpg».', 'The file was named “my_Whiskers_in_a_tie.jpg”.')])

case('heater', '🔥', ('Кто притащил обогреватель под стол?', 'Who sneaked a heater under their desk?'),
  ('Пробки выбило трижды за утро. Электрик нашёл виновника — обогреватель. Но чей он?', 'The fuses blew three times this morning. The electrician found the culprit — a space heater. But whose is it?'),
  [S('🧶', 'Тамара', 'Tamara', 'юрист', 'lawyer', 'cold', 'tea'),
   S('🌱', 'Ульяна', 'Uliana', 'HR', 'HR', 'cold', 'plant'),
   S('🥵', 'Кирилл', 'Kirk', 'фитнес-тренер офиса', 'office fitness coach', 'hot', 'early'),
   S('🧮', 'Зинаида', 'Zelda', 'бухгалтер', 'accountant', 'green', 'tea'),
   S('🎧', 'Миша', 'Misha', 'саппорт', 'support', 'music', 'late')], 0,
  [O(1, 'Ульяна в тот день вела онбординг в другом корпусе.', 'Uliana was running onboarding in another building that day.'),
   O(2, 'Кириллу и так жарко — он работает в шортах круглый год.', 'Kirk is always hot — he wears shorts all year round.'),
   O(3, 'Зинаида не тратит электричество зря и проверяет каждую розетку.', 'Zelda never wastes electricity and checks every socket.'),
   O(4, 'Миша работает в другой части этажа, далеко от того стола.', 'Misha works on the far side of the floor.'),
   T('cold', 'На обогревателе висит вязаный чехол «Чтобы ему тоже было тепло».', 'The heater wears a knitted cover: “So it stays warm too.”'),
   T('cold', 'Под столом — плед, тапочки с мехом и шерстяные носки.', 'Under the desk: a blanket, fluffy slippers and wool socks.'),
   T('tea', 'Рядом стоит термос с чаем с чабрецом.', 'Next to it, a thermos of thyme tea.'),
   T('tea', 'На обогревателе — круглый след от чашки с чаем.', 'A tea-cup ring mark is on top of the heater.')])

case('whiteboard', '🖍', ('Кто нарисовал усы на портрете на доске?', 'Who drew a moustache on the whiteboard portrait?'),
  ('Кто-то нарисовал на маркерной доске портрет директора. Похожий. С пышными усами. Стереть рука не поднимается.', 'Someone drew the director on the whiteboard. A good likeness. With a magnificent moustache. Nobody can bring themselves to erase it.'),
  [S('🎨', 'Соня', 'Sonya', 'дизайнер', 'designer', 'lefty', 'coffee'),
   S('🦒', 'Алла', 'Alla', 'архитектор', 'architect', 'tall', 'lefty'),
   S('🐭', 'Тимур', 'Timur', 'стажёр', 'intern', 'short', 'gum'),
   S('📢', 'Лёва', 'Leo', 'менеджер по продажам', 'sales manager', 'loud', 'tall'),
   S('🍵', 'Марина Петровна', 'Marina', 'главбух', 'chief accountant', 'tea', 'early')], 1,
  [O(0, 'Соня уже неделю в отпуске и шлёт фото с моря.', 'Sonya has been on holiday for a week, sending beach photos.'),
   O(2, 'Тимур не дотягивается до верха доски — а усы нарисованы на самом верху.', 'Timur can’t reach the top of the board — and the moustache is right at the top.'),
   O(3, 'Лёва весь день был на звонках с клиентами — у него 14 записей разговоров.', 'Leo was on client calls all day — 14 recorded calls.'),
   O(4, 'Марина Петровна рисует только графики и только по линейке.', 'Marina only draws charts, and only with a ruler.'),
   T('tall', 'Рисунок начинается выше двух метров — рисовал кто-то высокий.', 'The drawing starts above 6’6” — someone tall drew it.'),
   T('tall', 'Стул у доски не сдвинут — до верха достали без него.', 'The chair by the board wasn’t moved — they reached the top without it.'),
   T('lefty', 'Штрихи идут справа налево — рисовал левша.', 'The strokes go right to left — a left-hander drew this.'),
   T('lefty', 'Маркер смазан с левой стороны рисунка — ладонь левой руки.', 'The marker is smudged on the left — from a left palm.')])

case('balloons', '🎈', ('Кто заполнил кабинет воздушными шарами?', 'Who filled the office with balloons?'),
  ('Утром открыли кабинет руководителя — и оттуда выкатились 200 воздушных шаров. Повода никто не помнит.', 'This morning someone opened the manager’s office and 200 balloons rolled out. Nobody remembers the occasion.'),
  [S('🎤', 'Денис', 'Dennis', 'ведущий корпоративов', 'party host', 'loud', 'glitter'),
   S('🌅', 'Кирилл', 'Kirk', 'фитнес-тренер офиса', 'office fitness coach', 'early', 'hot'),
   S('🌙', 'Борис', 'Boris', 'охранник', 'security guard', 'late', 'puns'),
   S('💅', 'Вика', 'Vicky', 'маркетолог', 'marketer', 'glitter', 'late'),
   S('🧑‍💼', 'Катя', 'Kate', 'ассистент', 'assistant', 'plant', 'early')], 3,
  [O(0, 'Денис простыл и потерял голос — надуть 200 шаров он бы не смог.', 'Dennis has a cold and lost his voice — he couldn’t have blown up 200 balloons.'),
   O(1, 'Кирилл был на марафоне в выходные и в офис не заходил.', 'Kirk ran a marathon at the weekend and never came in.'),
   O(2, 'Борис дежурил, но сам вызвал всех посмотреть на шары — и очень удивился.', 'Boris was on duty but called everyone to see the balloons — and was genuinely surprised.'),
   O(4, 'У Кати аллергия на латекс — к шарам она не подходит.', 'Kate is allergic to latex and stays away from balloons.'),
   T('late', 'Шары появились после 21:00 — дежурный видел свет в кабинете.', 'The balloons appeared after 9 pm — the guard saw a light in the office.'),
   T('late', 'Насос для шаров взят со склада в 20:45.', 'The balloon pump was signed out of storage at 8:45 pm.'),
   T('glitter', 'Внутри каждого шара — блёстки.', 'Every balloon has glitter inside.'),
   T('glitter', 'На пороге кабинета блестящий след, как от кометы.', 'A sparkly trail on the doorstep, like a comet’s tail.')])

case('keys', '🔑', ('Кто потерял ключи от переговорки?', 'Who lost the meeting-room keys?'),
  ('Переговорка «Эверест» заперта, ключа нет, а там важная встреча и все печеньки.', 'The “Everest” meeting room is locked, the key is missing, and the important meeting and all the snacks are inside.'),
  [S('📋', 'Вера', 'Vera', 'офис-менеджер', 'office manager', 'early', 'plant'),
   S('🎒', 'Стас', 'Stan', 'стажёр', 'intern', 'music', 'sneak'),
   S('🔥', 'Мирон', 'Miron', 'продакт', 'product manager', 'spicy', 'coffee'),
   S('🚚', 'Гена', 'Gene', 'курьер', 'courier', 'bike', 'music'),
   S('🧶', 'Тамара', 'Tamara', 'юрист', 'lawyer', 'cold', 'red')], 1,
  [O(0, 'Вера хранит свой ключ на шнурке на шее — он на месте.', 'Vera keeps her key on a lanyard around her neck — it’s still there.'),
   O(2, 'Мирон в переговорку не заходил: он проводит встречи только стоя у кулера.', 'Miron never went in: he only holds meetings standing by the water cooler.'),
   O(3, 'Гена весь день был в разъездах — подтверждают 12 подписанных накладных.', 'Gene was out on deliveries all day — 12 signed waybills confirm it.'),
   O(4, 'Тамара сдала ключ под подпись ещё во вторник.', 'Tamara returned her key with a signature on Tuesday.'),
   T('music', 'В последний раз ключ видели рядом с наушниками — их забыли в переговорке.', 'The key was last seen next to a pair of headphones left in the room.'),
   T('music', 'Кто-то выходил из «Эвереста», напевая и не слыша, как его окликают.', 'Someone left “Everest” humming, not hearing anyone call after them.'),
   T('sneak', 'У двери — следы белых кроссовок.', 'White sneaker prints by the door.'),
   T('sneak', 'Брелок от ключа найден в коробке от белых кроссовок.', 'The key fob was found in a white sneaker box.')])

case('coffee', '☕', ('Кто выпил последний кофе и не загрузил зёрна?', 'Who drank the last coffee and didn’t refill the beans?'),
  ('Кофемашина пишет «Добавьте зёрна». Офис в 9:05 стоит перед ней в немом отчаянии.', 'The coffee machine says “Add beans”. At 9:05 the office stands before it in silent despair.'),
  [S('🎨', 'Соня', 'Sonya', 'дизайнер', 'designer', 'coffee', 'glitter'),
   S('🧑‍💻', 'Артём', 'Artie', 'разработчик', 'developer', 'coffee', 'late'),
   S('🍵', 'Марина Петровна', 'Marina', 'главбух', 'chief accountant', 'tea', 'early'),
   S('🖥', 'Рома', 'Roma', 'сисадмин', 'sysadmin', 'tech', 'early'),
   S('🎧', 'Лера', 'Lera', 'контент-менеджер', 'content manager', 'music', 'gum')], 1,
  [O(0, 'Соня в тот вечер ушла в 18:00 — у неё курсы рисования.', 'Sonya left at 6 pm for her drawing class.'),
   O(2, 'Марина Петровна кофе не пьёт: «Только чай, и только из блюдечка».', 'Marina doesn’t drink coffee: “Only tea, and only from a saucer.”'),
   O(3, 'Рома уходит в 17:00 и утром первым жалуется на пустую машину.', 'Roma leaves at 5 pm and was the first to complain about the empty machine.'),
   O(4, 'Лера была на удалёнке.', 'Lera was working from home.'),
   T('late', 'Последняя чашка сварена в 23:12.', 'The last cup was brewed at 11:12 pm.'),
   T('late', 'Ночной охранник видел у кофемашины кого-то с ноутбуком около полуночи.', 'The night guard saw someone with a laptop at the coffee machine around midnight.'),
   T('coffee', 'Выбран режим «тройной эспрессо» — так пьют только настоящие кофеманы.', 'The setting was “triple espresso” — only true coffee lovers go for that.'),
   T('coffee', 'Это была уже пятая чашка за вечер от одного человека.', 'It was the same person’s fifth cup of the evening.')])

case('slippers', '🩴', ('Чьи тапочки с зайцами стоят под столом?', 'Whose bunny slippers are under the desk?'),
  ('Под общим столом уже месяц живут розовые тапочки с зайцами. Хозяин не признаётся. Зайцы молчат.', 'Pink bunny slippers have lived under the shared desk for a month. The owner won’t confess. The bunnies are silent.'),
  [S('🧶', 'Тамара', 'Tamara', 'юрист', 'lawyer', 'cold', 'green'),
   S('🐭', 'Тимур', 'Timur', 'стажёр', 'intern', 'short', 'sweet'),
   S('🦒', 'Алла', 'Alla', 'архитектор', 'architect', 'tall', 'cold'),
   S('📊', 'Игорь Палыч', 'Igor', 'руководитель отдела', 'head of department', 'loud', 'early'),
   S('🐱', 'Ника', 'Nika', 'стажёр', 'intern', 'cat', 'short')], 0,
  [O(1, 'Тимур носит тапочки-акулы и гордится ими публично.', 'Timur wears shark slippers and is publicly proud of them.'),
   O(2, 'У Аллы 45-й размер ноги, а тапочки — 37-го.', 'Alla wears size 12 shoes, the slippers are a size 6.'),
   O(3, 'Игорь Палыч носит только классические туфли, даже на корпоративе.', 'Igor only wears classic shoes, even at parties.'),
   O(4, 'Ника принесла бы тапочки с котиками, а не с зайцами.', 'Nika would have brought kitten slippers, not bunnies.'),
   T('cold', 'Внутри тапочек — меховые стельки и грелка.', 'Inside the slippers: fur insoles and a hand warmer.'),
   T('cold', 'Тапочки стоят ровно у батареи.', 'The slippers sit right next to the radiator.'),
   T('green', 'На подошве написано зелёной ручкой: «Не трогать, это моё!».', 'Written on the sole in green pen: “Do not touch.”'),
   T('green', 'В тапочке забыт колпачок от зелёной ручки.', 'A green pen cap was found inside one slipper.')])

case('report', '📑', ('Кто случайно отправил отчёт «всем»?', 'Who accidentally hit “Reply All” on the report?'),
  ('Черновик отчёта с пометками «ну такое» и «тут приврём… шутка» ушёл на всю компанию. 600 человек в копии.', 'A draft report with notes like “meh” and “fudge this… kidding” went to the whole company. 600 people cc’d.'),
  [S('🧮', 'Зинаида', 'Zelda', 'бухгалтер', 'accountant', 'green', 'early'),
   S('🎓', 'Даня', 'Danny', 'аналитик', 'analyst', 'lefty', 'puns'),
   S('📈', 'Лёва', 'Leo', 'менеджер по продажам', 'sales manager', 'loud', 'coffee'),
   S('🔥', 'Мирон', 'Miron', 'продакт', 'product manager', 'spicy', 'puns'),
   S('📋', 'Вера', 'Vera', 'офис-менеджер', 'office manager', 'plant', 'early')], 3,
  [O(0, 'Зинаида пишет отчёты в бумажном журнале и отправляет только факсом.', 'Zelda writes reports in a paper ledger and sends them only by fax.'),
   O(1, 'Даня в тот день был на обучении без интернета.', 'Danny was at an offline training course all day.'),
   O(2, 'Лёва сам получил письмо и переслал его «на всякий случай» маме.', 'Leo received the email and forwarded it to his mum “just in case”.'),
   O(4, 'У Веры нет доступа к рассылке «вся компания».', 'Vera doesn’t have access to the all-company mailing list.'),
   T('puns', 'В теме письма: «Отчёт, который нельзя отчётливо понять».', 'The subject line: “A report you can’t report on.”'),
   T('puns', 'Подпись в письме: «С наилучшими пожеланиями и наихудшими каламбурами».', 'The signature: “Best wishes and worst puns.”'),
   T('spicy', 'Клавиатура отправителя липкая от острого соуса — ел прямо за работой.', 'The sender’s keyboard is sticky with hot sauce — eating at the desk.'),
   T('spicy', 'Во вложении случайно оказался рецепт соуса «Ад в банке».', 'The attachments accidentally included a recipe for “Hell in a Jar” hot sauce.')])

case('puzzle', '🧩', ('Кто украл последний кусочек пазла?', 'Who took the last jigsaw piece?'),
  ('Офис три месяца собирал пазл на 2000 деталей. Не хватает одной. Посередине.', 'The office spent three months on a 2,000-piece jigsaw. One piece is missing. In the middle.'),
  [S('🧑‍💼', 'Катя', 'Kate', 'ассистент', 'assistant', 'plant', 'mint'),
   S('🛡', 'Борис', 'Boris', 'охранник', 'security guard', 'late', 'mint'),
   S('🐭', 'Тимур', 'Timur', 'стажёр', 'intern', 'short', 'gum'),
   S('🎨', 'Соня', 'Sonya', 'дизайнер', 'designer', 'coffee', 'lefty'),
   S('🌙', 'Миша', 'Misha', 'саппорт', 'support', 'late', 'music')], 1,
  [O(0, 'Катя последнюю неделю работает с другого этажа.', 'Kate has been working on another floor all week.'),
   O(2, 'Тимур сам принёс этот пазл и плакал, когда увидел дыру.', 'Timur brought the puzzle himself and cried when he saw the hole.'),
   O(3, 'Соня всю неделю была на фотосессии в студии.', 'Sonya spent the week at a studio photoshoot.'),
   O(4, 'Миша считает пазлы «пустой тратой времени» и даже не подходил.', 'Misha calls jigsaws “a waste of time” and never went near it.'),
   T('late', 'Деталь пропала ночью — вечером её видели на фото.', 'The piece disappeared overnight — it was in a photo that evening.'),
   T('late', 'Ночью свет над столом с пазлом включали дважды.', 'The light over the puzzle table was switched on twice during the night.'),
   T('mint', 'На столе с пазлом — обёртка от мятного леденца.', 'A mint candy wrapper lies on the puzzle table.'),
   T('mint', 'Пазл пахнет мятой ровно там, где не хватает детали.', 'The puzzle smells of mint exactly where the piece is missing.')])

case('umbrella', '☂️', ('Кто взял чужой зонт в ливень?', 'Who borrowed someone’s umbrella in the rain?'),
  ('В ливень из стойки исчез огромный жёлтый зонт с уточками. Хозяйка зонта ушла домой под папкой.', 'During the downpour, a huge yellow umbrella with ducks vanished from the stand. Its owner went home under a folder.'),
  [S('🚲', 'Паша', 'Pasha', 'маркетолог', 'marketer', 'bike', 'red'),
   S('📸', 'Жанна', 'Joan', 'PR', 'PR', 'photo', 'gum'),
   S('🦒', 'Алла', 'Alla', 'архитектор', 'architect', 'tall', 'coffee'),
   S('🧣', 'Денис', 'Dennis', 'ведущий корпоративов', 'party host', 'red', 'tall'),
   S('🎓', 'Даня', 'Danny', 'аналитик', 'analyst', 'tech', 'lefty')], 3,
  [O(0, 'Паша уехал на велосипеде в дождевике — зонт на велосипеде бесполезен.', 'Pasha rode home in a raincoat — an umbrella is useless on a bike.'),
   O(1, 'Жанна осталась ночевать в офисе — ждала, пока кончится дождь.', 'Joan stayed late in the office waiting for the rain to stop.'),
   O(2, 'У Аллы свой зонт-трость — его видно с другого конца города.', 'Alla has her own giant cane umbrella, visible from across town.'),
   O(4, 'Даня ушёл до дождя — в 16:00, к стоматологу.', 'Danny left before the rain, at 4 pm, for a dentist appointment.'),
   T('red', 'Камера у выхода: кто-то в красном шарфе раскрывает жёлтый зонт с уточками.', 'Exit camera: someone in a red scarf opening a yellow duck umbrella.'),
   T('red', 'На ручке стойки для зонтов — красная ворсинка.', 'A red fibre on the umbrella stand handle.'),
   T('tall', 'Зонт пронесли так высоко, что он задел люстру в холле.', 'The umbrella was carried so high it hit the lobby chandelier.'),
   T('tall', 'Охранник: «Уточки проплыли у меня над головой».', 'The guard: “The ducks floated right above my head.”')])

case('karaoke', '🎤', ('Кто спел на весь этаж в переговорке?', 'Who sang to the whole floor from the meeting room?'),
  ('Микрофон в переговорке оказался включён в общую громкую связь. Весь этаж услышал «Арлекино» в исполнении неизвестного таланта.', 'The meeting-room mic was connected to the floor speakers. Everyone heard a passionate power ballad by a mystery talent.'),
  [S('🎤', 'Денис', 'Dennis', 'ведущий корпоративов', 'party host', 'loud', 'red'),
   S('📢', 'Лёва', 'Leo', 'менеджер по продажам', 'sales manager', 'loud', 'tea'),
   S('🎧', 'Лера', 'Lera', 'контент-менеджер', 'content manager', 'music', 'gum'),
   S('🍵', 'Тамара', 'Tamara', 'юрист', 'lawyer', 'tea', 'cold'),
   S('🧑‍🍳', 'Саша', 'Sasha', 'шеф столовой', 'canteen chef', 'spicy', 'early')], 1,
  [O(0, 'Денис в тот день вёл свадьбу в другом городе.', 'Dennis was hosting a wedding in another city that day.'),
   O(2, 'Лера в наушниках ничего не слышала и узнала обо всём из чата.', 'Lera had headphones on, heard nothing and found out from the chat.'),
   O(3, 'Тамара была в суде с девяти до шести.', 'Tamara was in court from nine to six.'),
   O(4, 'Саша пел только на кухне и только кастрюлям.', 'Sasha only sings in the kitchen, and only to the pots.'),
   T('loud', 'Колонки выдали перегрузку — голос был очень, очень громким.', 'The speakers overloaded — the voice was very, very loud.'),
   T('loud', 'Даже в лифте было слышно каждое слово.', 'Every word could be heard even in the elevator.'),
   T('tea', 'В переговорке остался стакан чая с лимоном «для связок».', 'A glass of lemon tea “for the vocal cords” was left in the room.'),
   T('tea', 'На микрофоне — капля чая с мёдом.', 'A drop of honey tea on the microphone.')])

case('dog', '🐶', ('Кто привёл собаку в офис?', 'Who brought a dog to the office?'),
  ('По опенспейсу бегает довольный корги и ворует носки. Пропуска у корги нет. Хозяина — тоже.', 'A happy corgi is running around the open space stealing socks. The corgi has no badge. Neither does its owner.'),
  [S('🐱', 'Ника', 'Nika', 'стажёр', 'intern', 'cat', 'sweet'),
   S('🌅', 'Кирилл', 'Kirk', 'фитнес-тренер офиса', 'office fitness coach', 'early', 'sneak'),
   S('🖥', 'Рома', 'Roma', 'сисадмин', 'sysadmin', 'tech', 'coffee'),
   S('🧑‍💼', 'Катя', 'Kate', 'ассистент', 'assistant', 'plant', 'sweet'),
   S('🚚', 'Гена', 'Gene', 'курьер', 'courier', 'bike', 'early')], 1,
  [O(0, 'У Ники кот, и он бы такого не простил.', 'Nika has a cat, and the cat would never forgive her.'),
   O(2, 'У Ромы аллергия на собак — он чихает уже третий час.', 'Roma is allergic to dogs and has been sneezing for three hours.'),
   O(3, 'Катя с утра в командировке — ей прислали фото корги, и она в восторге.', 'Kate is on a business trip — she got a corgi photo and is thrilled.'),
   O(4, 'Гена не возит пассажиров на велосипеде — даже четвероногих.', 'Gene doesn’t carry passengers on his bike — not even four-legged ones.'),
   T('early', 'Корги пришёл в офис в 7:40 — охрана записала «гость, рыжий».', 'The corgi arrived at 7:40 — security logged “visitor, ginger”.'),
   T('early', 'Утренняя пробежка заканчивалась у дверей офиса до восьми.', 'A morning run ended at the office door before eight.'),
   T('sneak', 'На поводке — бирка магазина спортивной обуви.', 'The leash has a sports shoe store tag on it.'),
   T('sneak', 'Корги охраняет пару белых кроссовок и никого к ним не подпускает.', 'The corgi guards a pair of white sneakers and won’t let anyone near.')])

case('calendar', '🗓', ('Кто перевернул все календари на декабрь?', 'Who flipped every calendar to December?'),
  ('Все настенные календари показывают декабрь, хотя за окном ноябрь. Половина офиса уже купила подарки.', 'Every wall calendar shows December, though it’s November. Half the office has already bought presents.'),
  [S('✨', 'Вика', 'Vicky', 'маркетолог', 'marketer', 'glitter', 'photo'),
   S('📦', 'Фёдор', 'Fyodor', 'завхоз', 'facilities', 'early', 'tech'),
   S('🎒', 'Стас', 'Stan', 'стажёр', 'intern', 'sweet', 'glitter'),
   S('🧮', 'Зинаида', 'Zelda', 'бухгалтер', 'accountant', 'green', 'tea'),
   S('🌙', 'Борис', 'Boris', 'охранник', 'security guard', 'late', 'sweet')], 2,
  [O(0, 'Вика на неделе снимала рекламу за городом.', 'Vicky was out of town filming an ad all week.'),
   O(1, 'Фёдор сам меняет календари — и был в шоке, что его опередили.', 'Fyodor changes the calendars himself and was shocked someone beat him to it.'),
   O(3, 'Зинаида живёт строго по датам и считает это «подделкой документов».', 'Zelda lives strictly by dates and calls this “document forgery”.'),
   O(4, 'Борис всю неделю в отпуске.', 'Boris has been on holiday all week.'),
   T('glitter', 'Каждая страница декабря посыпана блёстками.', 'Every December page has glitter on it.'),
   T('glitter', 'На полу у календарей — дорожка блёсток.', 'A trail of glitter on the floor by the calendars.'),
   T('sweet', 'На календаре нарисована ёлка из конфет-драже, приклеенных к странице.', 'A Christmas tree made of candy sprinkles is glued onto one calendar.'),
   T('sweet', 'За календарём спрятан шоколадный адвент-календарь. Пустой.', 'A chocolate advent calendar is hidden behind one. Empty.')])

CASES = [c for c in CASES if c['id'] != 'keys']
assert len(CASES) == 30, len(CASES)
ok = True
for i, c in enumerate(CASES):
    sus, cul = c['sus'], c['c']
    assert len(sus) == 5 and 8 <= len(c['clues']) <= 10, c['id']
    alive = set(range(5))
    trait_alive = set(range(5))
    for cl in c['clues']:
        if 'out' in cl:
            if cl['out'] == cul: print('CULPRIT RULED OUT', c['id']); ok = False
            alive.discard(cl['out'])
        else:
            if cl['tag'] not in sus[cul]['tags']: print('CULPRIT LACKS TAG', c['id'], cl['tag']); ok = False
            alive &= {j for j in range(5) if cl['tag'] in sus[j]['tags']}
            trait_alive &= {j for j in range(5) if cl['tag'] in sus[j]['tags']}
    if alive != {cul}: print('NOT UNIQUE', c['id'], alive); ok = False
    if len(trait_alive) > 2: print('TRAITS WEAK', c['id'], trait_alive); ok = False
    for s in sus:
        for t in s['tags']: assert t in TR, (c['id'], t)
ids = [c['id'] for c in CASES]; assert len(set(ids)) == 30
if not ok: sys.exit(1)

def mix(cl):  # алиби и признаки через одну: пара улик у игрока — разного вида
    a = [x for x in cl if 'out' in x]; t = [x for x in cl if 'tag' in x]; r = []
    while a or t:
        if a: r.append(a.pop(0))
        if t: r.append(t.pop(0))
    return r
out = {'traits': {k: {'ico': v[0], 'ru': v[1], 'en': v[2]} for k, v in TR.items()}, 'cases': []}
for c in CASES:
    out['cases'].append({
        'id': c['id'], 'ico': c['ico'], 'title': {'ru': c['t'][0], 'en': c['t'][1]}, 'intro': {'ru': c['intro'][0], 'en': c['intro'][1]},
        'suspects': [{'ico': s['ico'], 'name': {'ru': s['n'][0], 'en': s['n'][1]}, 'role': {'ru': s['r'][0], 'en': s['r'][1]}, 'traits': s['tags']} for s in c['sus']],
        'clues': [{'ru': cl['t'][0], 'en': cl['t'][1]} for cl in mix(c['clues'])],
    })
import os
dst = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'office_cases.json')
json.dump(out, open(dst, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok, culprits:', '{' + ','.join(str(c['c']) for c in CASES) + '}')
