"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Create category types
    const categoryTypes = [
      {
        name: "药品分类",
        code: "MEDICINE_TYPE",
        description: "药品的基本分类，包括处方药、非处方药等",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "适应症分类",
        code: "INDICATION_TYPE",
        description: "药品适应症分类，包括各类疾病领域",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "剂型分类",
        code: "DOSAGE_FORM_TYPE",
        description: "药品剂型分类，包括片剂、胶囊剂等",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "使用方式",
        code: "USAGE_TYPE",
        description: "药品使用方式分类，包括口服、注射等",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "储存条件",
        code: "STORAGE_TYPE",
        description: "药品储存条件分类，包括常温、冷藏等",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // 插入分类类型并获取插入后的数据
    await queryInterface.bulkInsert("CategoryTypes", categoryTypes, {});

    // 查询插入的分类类型以获取它们的ID
    const insertedTypes = await queryInterface.sequelize.query(
      `SELECT id, code FROM CategoryTypes WHERE code IN ('MEDICINE_TYPE', 'INDICATION_TYPE', 'DOSAGE_FORM_TYPE', 'USAGE_TYPE', 'STORAGE_TYPE')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // 创建代码到ID的映射
    const typeCodeToId = {};
    insertedTypes.forEach((type) => {
      typeCodeToId[type.code] = type.id;
    });

    // 2. Create categories for each type
    // 2.1 药品分类
    const medicineCategories = [
      {
        name: "处方药",
        code: "RX",
        typeId: typeCodeToId["MEDICINE_TYPE"],
        parentId: null,
        sort: 1,
        description: "需要凭执业医师处方才可调配、购买和使用的药品",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "非处方药",
        code: "OTC",
        typeId: typeCodeToId["MEDICINE_TYPE"],
        parentId: null,
        sort: 2,
        description: "消费者可不经医生处方，直接从药房或药店购买的药品",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // 插入主要分类并获取ID
    await queryInterface.bulkInsert("Categories", medicineCategories, {});

    // 查询插入的主分类以获取它们的ID
    const insertedMainCategories = await queryInterface.sequelize.query(
      `SELECT id, code FROM Categories WHERE code IN ('RX', 'OTC')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // 创建代码到ID的映射
    const categoryCodeToId = {};
    insertedMainCategories.forEach((category) => {
      categoryCodeToId[category.code] = category.id;
    });

    // 处方药子分类
    const medicineSubCategories = [
      {
        name: "抗生素类",
        code: "RX_ANTIBIOTIC",
        typeId: typeCodeToId["MEDICINE_TYPE"],
        parentId: categoryCodeToId["RX"],
        sort: 1,
        description: "用于治疗细菌感染的药物",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "心血管用药",
        code: "RX_CARDIOVASCULAR",
        typeId: typeCodeToId["MEDICINE_TYPE"],
        parentId: categoryCodeToId["RX"],
        sort: 2,
        description: "用于治疗心血管系统疾病的药物",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // OTC子分类
      {
        name: "感冒用药",
        code: "OTC_COLD",
        typeId: typeCodeToId["MEDICINE_TYPE"],
        parentId: categoryCodeToId["OTC"],
        sort: 1,
        description: "用于治疗感冒症状的非处方药",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Categories", medicineSubCategories, {});

    // 2.2 适应症分类
    const indicationCategories = [
      {
        name: "心血管系统",
        code: "CARDIOVASCULAR",
        typeId: typeCodeToId["INDICATION_TYPE"],
        parentId: null,
        sort: 1,
        description: "与心脏和血管相关的疾病",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "消化系统",
        code: "DIGESTIVE",
        typeId: typeCodeToId["INDICATION_TYPE"],
        parentId: null,
        sort: 2,
        description: "与消化道相关的疾病",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // 插入适应症主分类
    await queryInterface.bulkInsert("Categories", indicationCategories, {});

    // 查询插入的适应症主分类以获取它们的ID
    const insertedIndications = await queryInterface.sequelize.query(
      `SELECT id, code FROM Categories WHERE code IN ('CARDIOVASCULAR', 'DIGESTIVE')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // 更新分类代码到ID的映射
    insertedIndications.forEach((category) => {
      categoryCodeToId[category.code] = category.id;
    });

    // 适应症子分类
    const indicationSubCategories = [
      {
        name: "高血压",
        code: "HYPERTENSION",
        typeId: typeCodeToId["INDICATION_TYPE"],
        parentId: categoryCodeToId["CARDIOVASCULAR"],
        sort: 1,
        description: "血压持续升高的疾病",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Categories", indicationSubCategories, {});

    // 2.3 剂型分类
    const dosageFormCategories = [
      {
        name: "口服固体制剂",
        code: "ORAL_SOLID",
        typeId: typeCodeToId["DOSAGE_FORM_TYPE"],
        parentId: null,
        sort: 1,
        description: "以口服方式使用的固体药物制剂",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // 插入剂型主分类
    await queryInterface.bulkInsert("Categories", dosageFormCategories, {});

    // 查询插入的剂型主分类以获取ID
    const insertedDosageForms = await queryInterface.sequelize.query(
      `SELECT id, code FROM Categories WHERE code = 'ORAL_SOLID'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // 更新分类代码到ID的映射
    insertedDosageForms.forEach((category) => {
      categoryCodeToId[category.code] = category.id;
    });

    // 剂型子分类
    const dosageFormSubCategories = [
      {
        name: "片剂",
        code: "TABLET",
        typeId: typeCodeToId["DOSAGE_FORM_TYPE"],
        parentId: categoryCodeToId["ORAL_SOLID"],
        sort: 1,
        description: "药物与辅料混合压制成的片状制剂",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "胶囊剂",
        code: "CAPSULE",
        typeId: typeCodeToId["DOSAGE_FORM_TYPE"],
        parentId: categoryCodeToId["ORAL_SOLID"],
        sort: 2,
        description: "将药物装入空心胶囊中的制剂",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Categories", dosageFormSubCategories, {});

    // 2.4 使用方式
    const usageCategories = [
      {
        name: "口服给药",
        code: "ORAL",
        typeId: typeCodeToId["USAGE_TYPE"],
        parentId: null,
        sort: 1,
        description: "通过口服方式服用的药物",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // 插入使用方式主分类
    await queryInterface.bulkInsert("Categories", usageCategories, {});

    // 查询插入的使用方式主分类以获取ID
    const insertedUsages = await queryInterface.sequelize.query(
      `SELECT id, code FROM Categories WHERE code = 'INJECTION'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // 更新分类代码到ID的映射
    insertedUsages.forEach((category) => {
      categoryCodeToId[category.code] = category.id;
    });

    // 使用方式子分类
    const usageSubCategories = [
      {
        name: "静脉注射",
        code: "INTRAVENOUS",
        typeId: typeCodeToId["USAGE_TYPE"],
        parentId: categoryCodeToId["INJECTION"],
        sort: 1,
        description: "通过静脉注射给药",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Categories", usageSubCategories, {});

    // 2.5 储存条件
    const storageCategories = [
      {
        name: "常温储存",
        code: "ROOM_TEMP",
        typeId: typeCodeToId["STORAGE_TYPE"],
        parentId: null,
        sort: 1,
        description: "在室温条件下储存的药品",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Categories", storageCategories, {});
  },

  async down(queryInterface, Sequelize) {
    // 删除所有分类数据
    await queryInterface.bulkDelete("Categories", null, {});
    // 删除所有分类类型
    await queryInterface.bulkDelete("CategoryTypes", null, {});
  },
};
