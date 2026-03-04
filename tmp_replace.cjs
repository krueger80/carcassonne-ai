const fs = require('fs');
const files = [
    'tests/core/DragonFairyRiver.test.ts',
    'src/core/data/dragonFairyTiles.ts',
    'src/core/engine/GameEngine.ts',
    'src/store/gameStore.ts'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/df31_B_back_left/g, 'df31_B_back_top');
    content = content.replace(/df31_B_back_right/g, 'df31_B_back_bottom');
    content = content.replace(/df31_B_front_left/g, 'df31_B_front_top');
    content = content.replace(/df31_B_front_right/g, 'df31_B_front_bottom');
    fs.writeFileSync(file, content);
});
console.log('Files updated.');
